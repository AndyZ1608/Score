import { MatchStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateScoresForMatch, getResult } from "@/lib/scoring";

const resultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  status: z.nativeEnum(MatchStatus),
  note: z.string().max(500).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } });
  if (!admin || admin.role !== UserRole.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = resultSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });

  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id }, select: { id: true } });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const { homeScore, awayScore, status, note } = parsed.data;
  const actualResult = status === MatchStatus.FINISHED ? getResult(homeScore, awayScore) : null;

  await prisma.match.update({
    where: { id },
    data: {
      status,
      homeScore,
      awayScore,
      minute: null,
      actualResult,
      resultSource: "ADMIN",
      adminHomeScore: homeScore,
      adminAwayScore: awayScore,
      adminStatus: status,
      adminResultUpdatedAt: new Date(),
      adminResultUpdatedById: admin.id,
      adminNote: note ?? null,
    },
  });

  let recalculatedPredictions = 0;
  if (status === MatchStatus.FINISHED) {
    const result = await calculateScoresForMatch(id);
    recalculatedPredictions = result.calculated;
  } else {
    const result = await prisma.prediction.updateMany({
      where: { matchId: id },
      data: { pointsResult: 0, pointsExactScore: 0, totalPoints: 0, isCalculated: false },
    });
    recalculatedPredictions = result.count;
  }

  return NextResponse.json({
    success: true,
    matchId: id,
    resultSource: "ADMIN",
    homeScore,
    awayScore,
    recalculatedPredictions,
  });
}
