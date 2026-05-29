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
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold">Admin Matches</h1>
        <p className="mt-2 text-zinc-400">Override final results. Admin results are authoritative and will not be overwritten by provider sync.</p>
      </div>
      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="premium-card-gradient border-emerald-500/25">
            <CardHeader>
              <CardTitle className="flex flex-col gap-2 text-lg sm:flex-row sm:items-center sm:justify-between">
                <span>{match.homeTeam} vs {match.awayTeam}</span>
                <span className="text-sm font-semibold text-emerald-100">{formatMatchDateTime(match.kickoffTime)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-4">
                <div><span className="text-zinc-500">Status:</span> {match.status}</div>
                <div><span className="text-zinc-500">Current:</span> {match.homeScore ?? "-"} - {match.awayScore ?? "-"}</div>
                <div><span className="text-zinc-500">Provider:</span> {match.providerHomeScore ?? "-"} - {match.providerAwayScore ?? "-"} ({match.providerStatus ?? "n/a"})</div>
                <div><span className="text-zinc-500">Source:</span> {match.resultSource}</div>
              </div>
              <AdminMatchResultForm match={{ id: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam, status: match.status, homeScore: match.homeScore, awayScore: match.awayScore }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
