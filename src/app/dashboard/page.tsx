import Link from "next/link";
import { Award, CheckCircle2, Compass, Trophy } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/match-card";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId, username } = await requireAuth();
  const [aggregate, correctResults, exactScores, upcoming] = await Promise.all([
    prisma.prediction.aggregate({ where: { userId }, _sum: { totalPoints: true }, _count: true }),
    prisma.prediction.count({ where: { userId, pointsResult: 1 } }),
    prisma.prediction.count({ where: { userId, pointsExactScore: 3 } }),
    prisma.match.findMany({
      where: { status: "SCHEDULED", kickoffTime: { gt: new Date() } },
      orderBy: { kickoffTime: "asc" },
      take: 5,
      include: { predictions: { where: { userId }, take: 1 } },
    }),
  ]);
  const stats = [
    ["Total Points", aggregate._sum.totalPoints ?? 0, Trophy],
    ["Predictions Made", aggregate._count, Compass],
    ["Exact Scores", exactScores, Award],
    ["Correct Results", correctResults, CheckCircle2],
  ] as const;
  return (
    <div className="space-y-9">
      <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-7">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-400">Welcome, {username}. Your World Cup 2026 prediction overview.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, Icon]) => <Card key={label} className="premium-card-gradient border-zinc-800"><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs text-zinc-400">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><Icon className="h-7 w-7 text-indigo-400" /></CardContent></Card>)}
      </section>
      <section className="space-y-5">
        <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Upcoming matches</h2><Link className="text-sm text-indigo-400 hover:text-indigo-300" href="/matches">View all matches</Link></div>
        {upcoming.length ? <div className="grid gap-4 lg:grid-cols-2">{upcoming.map(({ predictions, ...match }) => <MatchCard key={match.id} match={{ ...match, prediction: predictions[0] ?? null }} />)}</div> : <p className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-400">No upcoming matches.</p>}
      </section>
    </div>
  );
}
