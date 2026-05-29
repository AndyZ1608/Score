import { MatchStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResult } from "@/lib/scoring";
import { predictionUpdateSchema } from "@/lib/validators";
import { isPredictionLocked, PREDICTION_LOCKED_MESSAGE } from "@/lib/prediction-lock";
import { isMatchVisibleForActiveProvider } from "@/lib/provider-config";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = predictionUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { id } = await params;
  const existing = await prisma.prediction.findUnique({ where: { id }, include: { match: true } });
  if (!existing) return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  if (!isMatchVisibleForActiveProvider(existing.match)) return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  if (existing.userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (existing.match.status !== MatchStatus.SCHEDULED || isPredictionLocked(existing.match.kickoffTime)) {
    return NextResponse.json({ error: PREDICTION_LOCKED_MESSAGE }, { status: 403 });
  }
  const { predictedHomeScore, predictedAwayScore } = parsed.data;
  const prediction = await prisma.prediction.update({
    where: { id },
    data: {
      predictedHomeScore,
      predictedAwayScore,
      predictedResult: getResult(predictedHomeScore, predictedAwayScore),
      isCalculated: false,
      pointsResult: 0,
      pointsExactScore: 0,
      totalPoints: 0,
    },
  });
  return NextResponse.json({ prediction });
}
