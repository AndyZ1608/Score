import { notFound } from "next/navigation";
import { LocalKickoff } from "@/components/match-card";
import { PredictionForm } from "@/components/prediction-form";
import { TeamNameBadge } from "@/components/team-name-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPredictionLocked } from "@/lib/prediction-lock";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireAuth();
  const match = await prisma.match.findUnique({ where: { id: (await params).id }, include: { predictions: { where: { userId }, take: 1 } } });
  if (!match) notFound();
  const prediction = match.predictions[0] ?? null;
  const locked = match.status !== "SCHEDULED" || isPredictionLocked(match.kickoffTime);
  const showScore = (match.kickoffTime <= new Date() || match.status === "LIVE" || match.status === "FINISHED") && (match.status === "FINISHED" || match.status === "LIVE");
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <Card className="premium-card-gradient border-zinc-800">
        <CardHeader className="space-y-4">
          <CardTitle className="sr-only">{match.homeTeam} vs {match.awayTeam}</CardTitle>
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <TeamNameBadge teamName={match.homeTeam} size="lg" align="center" className="w-full" />
            <span className="rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/85 dark:text-slate-200">vs</span>
            <TeamNameBadge teamName={match.awayTeam} size="lg" align="center" className="w-full" />
          </div>
          <p className="text-center text-sm text-zinc-400"><LocalKickoff value={match.kickoffTime} /> | {match.stadium}</p>
          {match.status === "LIVE" && match.minute !== null && <p className="text-center text-sm font-bold text-red-200">LIVE {match.minute}&apos;</p>}
        </CardHeader>
        <CardContent className="space-y-6">
          {showScore && <div className="text-center text-5xl font-bold">{match.homeScore ?? "-"} : {match.awayScore ?? "-"}</div>}
          <PredictionForm matchId={match.id} homeTeam={match.homeTeam} awayTeam={match.awayTeam} kickoffTime={match.kickoffTime} prediction={prediction} locked={locked} />
          {match.status === "FINISHED" && prediction && <p className="rounded-lg bg-emerald-500/10 p-4 text-emerald-300">Points earned: <strong>{prediction.totalPoints}</strong></p>}
        </CardContent>
      </Card>
      <Card className="premium-card-gradient h-fit border-zinc-800"><CardHeader><CardTitle className="text-lg">Scoring rules</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-zinc-300"><p>Correct win, draw or loss: <strong className="text-emerald-400">+1 point</strong></p><p>Exact score: <strong className="text-emerald-400">+3 points</strong></p><p>Exact prediction total: <strong className="text-emerald-400">4 points</strong></p><p className="pt-3 text-zinc-500">Predictions close 1 hour before kickoff.</p></CardContent></Card>
    </div>
  );
}
