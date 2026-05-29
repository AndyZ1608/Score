import { AdminMatchResultForm } from "@/components/admin-match-result-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { formatMatchDateTime } from "@/lib/date-format";
import { prisma } from "@/lib/prisma";
import { getActiveMatchWhere } from "@/lib/provider-config";

export default async function AdminPage() {
  await requireAdmin();
  const matches = await prisma.match.findMany({ where: getActiveMatchWhere(), orderBy: { kickoffTime: "asc" } });

  return (
    <div className="space-y-7 text-white">
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-xl">
        <h1 className="text-3xl font-black text-white">Admin Matches</h1>
        <p className="mt-2 text-sm font-medium text-slate-300">Override final results. Admin results are authoritative and will not be overwritten by provider sync.</p>
      </div>
      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="rounded-2xl border border-slate-700 bg-slate-900/95 text-white shadow-lg shadow-slate-950/30">
            <CardHeader>
              <CardTitle className="flex flex-col gap-2 text-lg sm:flex-row sm:items-center sm:justify-between">
                <span className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-lg font-black text-white">{match.homeTeam} vs {match.awayTeam}</span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-100">{formatMatchDateTime(match.kickoffTime)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm md:grid-cols-4">
                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-slate-200"><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span>{match.status}</div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-slate-200"><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Current</span>{match.homeScore ?? "-"} - {match.awayScore ?? "-"}</div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-slate-200"><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Provider</span>{match.providerHomeScore ?? "-"} - {match.providerAwayScore ?? "-"} ({match.providerStatus ?? "n/a"})</div>
                <div className="flex items-center">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${match.resultSource === "ADMIN" ? "border-amber-300/40 bg-amber-300/15 text-amber-100" : "border-sky-300/40 bg-sky-300/15 text-sky-100"}`}>
                    {match.resultSource === "ADMIN" ? "Admin override" : "Provider result"}
                  </span>
                </div>
              </div>
              <AdminMatchResultForm match={{ id: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam, status: match.status, homeScore: match.homeScore, awayScore: match.awayScore }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
