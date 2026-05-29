import { LeaderboardTable } from "@/components/leaderboard-table";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveMatchWhere } from "@/lib/provider-config";

export default async function LeaderboardPage() {
  const { userId } = await requireAuth();
  const users = await prisma.user.findMany({ where: { role: "USER", isHidden: false }, select: { id: true, username: true, avatarId: true, predictions: { where: { match: { is: getActiveMatchWhere() } }, select: { totalPoints: true, pointsResult: true, pointsExactScore: true } } } });
  const rows = users.map((user) => ({
    userId: user.id,
    username: user.username,
    avatarId: user.avatarId,
    totalPoints: user.predictions.reduce((total, prediction) => total + prediction.totalPoints, 0),
    correctResults: user.predictions.filter((prediction) => prediction.pointsResult === 1).length,
    exactScores: user.predictions.filter((prediction) => prediction.pointsExactScore === 3).length,
    totalPredictions: user.predictions.length,
  })).sort((a, b) => b.totalPoints - a.totalPoints || b.exactScores - a.exactScores || b.correctResults - a.correctResults || a.username.localeCompare(b.username)).map((row, index) => ({ rank: index + 1, ...row }));
  return <div className="space-y-7"><div><h1 className="text-3xl font-bold">Leaderboard</h1><p className="mt-2 text-zinc-400">Ranked by points, exact scores, then correct results.</p></div><LeaderboardTable rows={rows} currentUserId={userId} /></div>;
}
