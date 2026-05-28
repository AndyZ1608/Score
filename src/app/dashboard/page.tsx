import Link from "next/link";
import { Award, CheckCircle2, ClipboardCheck, Trophy } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { FootballHero } from "@/components/football-hero";
import { MatchCard } from "@/components/match-card";

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
    {
      label: "Total Points",
      value: aggregate._sum.totalPoints ?? 0,
      description: "Your current tournament score",
      icon: Trophy,
      variant: "amber",
    },
    {
      label: "Predictions Made",
      value: aggregate._count,
      description: "Submitted score predictions",
      icon: ClipboardCheck,
      variant: "sky",
    },
    {
      label: "Exact Scores",
      value: exactScores,
      description: "Perfect scoreline calls",
      icon: Award,
      variant: "emerald",
    },
    {
      label: "Correct Results",
      value: correctResults,
      description: "Winner or draw predicted",
      icon: CheckCircle2,
      variant: "rose",
    },
  ] as const;
  return (
    <div className="space-y-9">
      <FootballHero username={username} />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.label} {...stat} />
        ))}
      </section>
      <section className="space-y-5">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white">Upcoming matches</h2><Link className="text-sm font-semibold text-lime-300 hover:text-lime-200" href="/matches">View all matches</Link></div>
        {upcoming.length ? <div className="grid gap-4 lg:grid-cols-2">{upcoming.map(({ predictions, ...match }) => <MatchCard key={match.id} match={{ ...match, prediction: predictions[0] ?? null }} />)}</div> : <p className="rounded-2xl border border-emerald-500/25 bg-slate-950/80 p-8 text-center text-emerald-100">No upcoming matches.</p>}
      </section>
    </div>
  );
}
