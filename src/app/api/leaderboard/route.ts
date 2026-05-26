import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await prisma.user.findMany({
    select: { id: true, username: true, predictions: { select: { totalPoints: true, pointsResult: true, pointsExactScore: true } } },
  });
  const leaderboard = users
    .map((user) => ({
      userId: user.id,
      username: user.username,
      totalPoints: user.predictions.reduce((sum, prediction) => sum + prediction.totalPoints, 0),
      correctResults: user.predictions.filter((prediction) => prediction.pointsResult === 1).length,
      exactScores: user.predictions.filter((prediction) => prediction.pointsExactScore === 3).length,
      totalPredictions: user.predictions.length,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || b.exactScores - a.exactScores || b.correctResults - a.correctResults || a.username.localeCompare(b.username))
    .map((row, index) => ({ rank: index + 1, ...row }));
  return NextResponse.json({ leaderboard, currentUserId: session.userId });
}
