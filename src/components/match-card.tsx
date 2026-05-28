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
    SCHEDULED: "border-lime-300/30 bg-lime-300/10 text-lime-200",
    LIVE: "border-red-400/40 bg-red-400/15 text-red-200 animate-pulse",
    FINISHED: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    POSTPONED: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
  }[status];
  const label = {
    SCHEDULED: "Upcoming",
    LIVE: "Live",
    FINISHED: "Finished",
    POSTPONED: "Postponed",
  }[status];
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${style}`}>{label}</span>;
}

export function LocalKickoff({ value }: { value: Date | string }) {
  return <time dateTime={new Date(value).toISOString()}>{formatMatchDateTime(value)}</time>;
}

export function MatchCard({ match }: { match: MatchWithPrediction }) {
  const locked = match.status !== "SCHEDULED" || new Date(match.kickoffTime).getTime() <= Date.now();
  const hasKickedOff = new Date(match.kickoffTime).getTime() <= Date.now();
  const showScore = hasKickedOff && (match.status === "FINISHED" || match.status === "LIVE");
  return (
    <Card className="premium-card-gradient border-emerald-500/25 shadow-lg shadow-emerald-950/20 transition hover:border-lime-300/40">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={match.status} />
          <span className="text-xs text-zinc-500">{match.groupName || match.stage}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-emerald-100"><CalendarClock className="h-4 w-4 text-lime-300" /><LocalKickoff value={match.kickoffTime} /></div>
        <div className="grid grid-cols-1 items-center gap-3 text-center sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <TeamNameBadge teamName={match.homeTeam} align="center" className="w-full" />
          {showScore ? <span className="rounded-lg bg-slate-950 px-3 py-2 text-lg font-extrabold text-white shadow-sm dark:bg-white dark:text-slate-950">{match.homeScore ?? "-"} : {match.awayScore ?? "-"}</span> : <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">VS</span>}
          <TeamNameBadge teamName={match.awayTeam} align="center" className="w-full" />
        </div>
        {match.prediction && <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300">Your prediction: <strong>{match.prediction.predictedHomeScore} - {match.prediction.predictedAwayScore}</strong>{match.prediction.isCalculated && <span className="float-right text-emerald-400">+{match.prediction.totalPoints} pts</span>}</div>}
        <Link href={`/matches/${match.id}`} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 shadow-sm shadow-emerald-950/30 transition hover:bg-lime-300">
          {locked ? <LockKeyhole className="h-4 w-4" /> : null}{locked ? "View match" : match.prediction ? "Edit prediction" : "Predict score"}
        </Link>
      </CardContent>
    </Card>
  );
}
