"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Prediction } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamNameBadge } from "@/components/team-name-badge";
import { formatMatchDateTime } from "@/lib/date-format";
import { getPredictionLockTime } from "@/lib/prediction-lock";

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  kickoffTime,
  prediction,
  locked,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: Date | string;
  prediction?: Prediction | null;
  locked: boolean;
}) {
  const router = useRouter();
  const [home, setHome] = useState(prediction ? String(prediction.predictedHomeScore) : "");
  const [away, setAway] = useState(prediction ? String(prediction.predictedAwayScore) : "");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (locked) {
      toast.error(prediction ? "Prediction locked. Your saved prediction can no longer be changed." : "Predictions are closed for this match.");
      return;
    }
    const predictedHomeScore = Number(home);
    const predictedAwayScore = Number(away);
    if (!Number.isInteger(predictedHomeScore) || !Number.isInteger(predictedAwayScore) || predictedHomeScore < 0 || predictedAwayScore < 0) {
      toast.error("Scores must be non-negative integers.");
      return;
    }
    setSaving(true);
    const response = await fetch(prediction ? `/api/predictions/${prediction.id}` : "/api/predictions", {
      method: prediction ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, predictedHomeScore, predictedAwayScore }),
    });
    const body = await response.json();
    setSaving(false);
    if (!response.ok) {
      toast.error(body.error || "Unable to save prediction.");
      return;
    }
    toast.success("Prediction saved.");
    router.refresh();
  }

  const outcome = home !== "" && away !== "" ? Number(home) > Number(away) ? `${homeTeam} win` : Number(home) < Number(away) ? `${awayTeam} win` : "Draw" : null;
  const scoreInputClass =
    "h-14 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-black text-slate-950 shadow-inner placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/40 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";
  const lockTime = getPredictionLockTime(kickoffTime);
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className={`rounded-xl border p-3 text-sm font-semibold ${locked ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-emerald-300/25 bg-emerald-500/10 text-emerald-100"}`}>
        {locked
          ? prediction
            ? "Prediction locked. Your saved prediction can no longer be changed."
            : "Predictions are closed for this match."
          : `Predictions close at ${formatMatchDateTime(lockTime)}`}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3 sm:gap-4">
          <div className="space-y-2"><Label htmlFor="home" className="sr-only">{homeTeam}</Label><TeamNameBadge teamName={homeTeam} size="sm" className="w-full" /><Input id="home" type="number" inputMode="numeric" min="0" max="99" step="1" placeholder="0" value={home} onChange={(event) => setHome(event.target.value)} className={scoreInputClass} disabled={locked} required /></div>
          <span className="pb-3 text-2xl font-black text-slate-900 dark:text-white">:</span>
          <div className="space-y-2"><Label htmlFor="away" className="sr-only">{awayTeam}</Label><TeamNameBadge teamName={awayTeam} size="sm" className="w-full" /><Input id="away" type="number" inputMode="numeric" min="0" max="99" step="1" placeholder="0" value={away} onChange={(event) => setAway(event.target.value)} className={scoreInputClass} disabled={locked} required /></div>
        </div>
      </div>
      {outcome && <p className="rounded-md border border-emerald-300/20 bg-emerald-500/10 p-3 text-center text-sm font-semibold text-emerald-100">Predicted result: {outcome}</p>}
      <Button disabled={saving || locked} className="w-full bg-lime-300 font-black text-slate-950 hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200">{saving ? "Saving..." : locked ? "Prediction locked" : prediction ? "Update prediction" : "Submit prediction"}</Button>
    </form>
  );
}
