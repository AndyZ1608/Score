"use client";

import Link from "next/link";
import { CalendarClock, LockKeyhole } from "lucide-react";
import type { Match, Prediction } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { TeamNameBadge } from "@/components/team-name-badge";
import { formatMatchDateTime } from "@/lib/date-format";

export type MatchWithPrediction = Match & { prediction?: Prediction | null };

function StatusBadge({ status }: { status: Match["status"] }) {
  const style = {
    SCHEDULED: "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
    LIVE: "border-red-400/30 bg-red-400/10 text-red-300 animate-pulse",
    FINISHED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    POSTPONED: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
  }[status];
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${style}`}>{status}</span>;
}

export function LocalKickoff({ value }: { value: Date | string }) {
  return <time dateTime={new Date(value).toISOString()}>{formatMatchDateTime(value)}</time>;
}

export function MatchCard({ match }: { match: MatchWithPrediction }) {
  const locked = match.status !== "SCHEDULED" || new Date(match.kickoffTime).getTime() <= Date.now();
  const hasKickedOff = new Date(match.kickoffTime).getTime() <= Date.now();
  const showScore = hasKickedOff && (match.status === "FINISHED" || match.status === "LIVE");
  return (
    <Card className="premium-card-gradient border-zinc-800 transition hover:border-indigo-500/30">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={match.status} />
          <span className="text-xs text-zinc-500">{match.groupName || match.stage}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400"><CalendarClock className="h-4 w-4 text-indigo-400" /><LocalKickoff value={match.kickoffTime} /></div>
        <div className="grid grid-cols-1 items-center gap-3 text-center sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <TeamNameBadge teamName={match.homeTeam} align="center" className="w-full" />
          {showScore ? <span className="rounded-lg bg-slate-950 px-3 py-2 text-lg font-extrabold text-white shadow-sm dark:bg-white dark:text-slate-950">{match.homeScore ?? "-"} : {match.awayScore ?? "-"}</span> : <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">VS</span>}
          <TeamNameBadge teamName={match.awayTeam} align="center" className="w-full" />
        </div>
        {match.prediction && <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300">Your prediction: <strong>{match.prediction.predictedHomeScore} - {match.prediction.predictedAwayScore}</strong>{match.prediction.isCalculated && <span className="float-right text-emerald-400">+{match.prediction.totalPoints} pts</span>}</div>}
        <Link href={`/matches/${match.id}`} className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          {locked ? <LockKeyhole className="h-4 w-4" /> : null}{locked ? "View match" : match.prediction ? "Edit prediction" : "Predict score"}
        </Link>
      </CardContent>
    </Card>
  );
}
