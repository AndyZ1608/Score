import { MatchStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const status = params.get("status");
  const date = params.get("date");
  const stage = params.get("stage");
  const where: Prisma.MatchWhereInput = {};
  if (status && Object.values(MatchStatus).includes(status as MatchStatus)) where.status = status as MatchStatus;
  if (stage) where.stage = stage;
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    where.kickoffTime = { gte: start, lt: end };
  }
  const matches = await prisma.match.findMany({
    where,
    orderBy: { kickoffTime: "asc" },
    include: { predictions: { where: { userId: session.userId }, take: 1 } },
  });
  return NextResponse.json({
    matches: matches.map(({ predictions, ...match }) => ({ ...match, prediction: predictions[0] ?? null })),
  });
}
