"use client";

import { useState, type FormEvent } from "react";
import type { MatchStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_STATUSES = ["SCHEDULED", "LIVE", "FINISHED", "POSTPONED", "CANCELLED"] as const;

export interface AdminMatchResultFormMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
}

export function AdminMatchResultForm({ match }: { match: AdminMatchResultFormMatch }) {
  const router = useRouter();
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() ?? "0");
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() ?? "0");
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsedHome = Number(homeScore);
    const parsedAway = Number(awayScore);
    if (!Number.isInteger(parsedHome) || !Number.isInteger(parsedAway) || parsedHome < 0 || parsedAway < 0) {
      toast.error("Scores must be non-negative integers.");
      return;
    }
    if (!window.confirm(`Override final result for ${match.homeTeam} vs ${match.awayTeam}?`)) return;

    setSaving(true);
    const response = await fetch(`/api/admin/matches/${match.id}/result`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeScore: parsedHome, awayScore: parsedAway, status }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(body.error || "Unable to update result.");
      return;
    }
    toast.success(`Result saved. Recalculated ${body.recalculatedPredictions ?? 0} predictions.`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 sm:grid-cols-[90px_90px_160px_auto]">
      <Input type="number" min="0" step="1" value={homeScore} onChange={(event) => setHomeScore(event.target.value)} className="border-slate-300 bg-white text-center text-lg font-black text-slate-950 focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:border-slate-600 dark:bg-slate-950 dark:text-white" aria-label={`${match.homeTeam} score`} />
      <Input type="number" min="0" step="1" value={awayScore} onChange={(event) => setAwayScore(event.target.value)} className="border-slate-300 bg-white text-center text-lg font-black text-slate-950 focus-visible:ring-2 focus-visible:ring-emerald-400/50 dark:border-slate-600 dark:bg-slate-950 dark:text-white" aria-label={`${match.awayTeam} score`} />
      <select value={status} onChange={(event) => setStatus(event.target.value as MatchStatus)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 dark:border-slate-600 dark:bg-slate-950 dark:text-white">
        {ADMIN_STATUSES.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
      <Button type="submit" disabled={saving} className="bg-emerald-500 font-black text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300">
        {saving ? "Saving..." : "Save override"}
      </Button>
    </form>
  );
}
