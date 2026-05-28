"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Prediction } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamNameBadge } from "@/components/team-name-badge";

export function PredictionForm({ matchId, homeTeam, awayTeam, prediction, locked }: { matchId: string; homeTeam: string; awayTeam: string; prediction?: Prediction | null; locked: boolean }) {
  const router = useRouter();
  const [home, setHome] = useState(prediction ? String(prediction.predictedHomeScore) : "");
  const [away, setAway] = useState(prediction ? String(prediction.predictedAwayScore) : "");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
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

  if (locked) return <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">Prediction locked</div>;
  const outcome = home !== "" && away !== "" ? Number(home) > Number(away) ? `${homeTeam} win` : Number(home) < Number(away) ? `${awayTeam} win` : "Draw" : null;
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="home" className="sr-only">{homeTeam}</Label><TeamNameBadge teamName={homeTeam} size="sm" className="w-full" /><Input id="home" type="number" min="0" step="1" value={home} onChange={(event) => setHome(event.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="away" className="sr-only">{awayTeam}</Label><TeamNameBadge teamName={awayTeam} size="sm" className="w-full" /><Input id="away" type="number" min="0" step="1" value={away} onChange={(event) => setAway(event.target.value)} required /></div>
      </div>
      {outcome && <p className="rounded-md bg-indigo-500/10 p-3 text-center text-sm text-indigo-300">Predicted result: {outcome}</p>}
      <Button disabled={saving} className="w-full bg-emerald-600 text-white hover:bg-emerald-500">{saving ? "Saving..." : prediction ? "Update prediction" : "Submit prediction"}</Button>
    </form>
  );
}
