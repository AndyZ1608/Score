import { notFound } from "next/navigation";
import { LocalKickoff } from "@/components/match-card";
import { PredictionForm } from "@/components/prediction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireAuth();
  const match = await prisma.match.findUnique({ where: { id: (await params).id }, include: { predictions: { where: { userId }, take: 1 } } });
  if (!match) notFound();
  const prediction = match.predictions[0] ?? null;
  const locked = match.status !== "SCHEDULED" || match.kickoffTime <= new Date();
  const showScore = match.kickoffTime <= new Date() && (match.status === "FINISHED" || match.status === "LIVE");
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <Card className="premium-card-gradient border-zinc-800">
        <CardHeader><CardTitle>{match.homeTeam} vs {match.awayTeam}</CardTitle><p className="text-sm text-zinc-400"><LocalKickoff value={match.kickoffTime} /> | {match.stadium}</p></CardHeader>
        <CardContent className="space-y-6">
          {showScore && <div className="text-center text-5xl font-bold">{match.homeScore ?? "-"} : {match.awayScore ?? "-"}</div>}
          <PredictionForm matchId={match.id} homeTeam={match.homeTeam} awayTeam={match.awayTeam} prediction={prediction} locked={locked} />
          {match.status === "FINISHED" && prediction && <p className="rounded-lg bg-emerald-500/10 p-4 text-emerald-300">Points earned: <strong>{prediction.totalPoints}</strong></p>}
        </CardContent>
      </Card>
      <Card className="premium-card-gradient h-fit border-zinc-800"><CardHeader><CardTitle className="text-lg">Scoring rules</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-zinc-300"><p>Correct win, draw or loss: <strong className="text-emerald-400">+1 point</strong></p><p>Exact score: <strong className="text-emerald-400">+3 points</strong></p><p>Exact prediction total: <strong className="text-emerald-400">4 points</strong></p><p className="pt-3 text-zinc-500">Predictions lock at kickoff.</p></CardContent></Card>
    </div>
  );
}
