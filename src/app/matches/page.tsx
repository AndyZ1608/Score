import Link from "next/link";
import { MatchStatus } from "@prisma/client";
import { MatchCard } from "@/components/match-card";
import { requireAuth } from "@/lib/auth";
import { formatMatchDate } from "@/lib/date-format";
import { prisma } from "@/lib/prisma";
import { getActiveMatchWhere } from "@/lib/provider-config";

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { userId } = await requireAuth();
  const { status } = await searchParams;
  const selected = Object.values(MatchStatus).includes(status as MatchStatus) ? status as MatchStatus : undefined;
  const matches = await prisma.match.findMany({
    where: { ...getActiveMatchWhere(), ...(selected ? { status: selected } : {}) },
    orderBy: { kickoffTime: "asc" },
    include: { predictions: { where: { userId }, take: 1 } },
  });
  const groups = matches.reduce<Array<{ date: string; matches: typeof matches }>>((all, match) => {
    const date = formatMatchDate(match.kickoffTime);
    const group = all.find((entry) => entry.date === date);
    if (group) group.matches.push(match);
    else all.push({ date, matches: [match] });
    return all;
  }, []);
  const tabs: Array<[string, string | undefined]> = [["All", undefined], ["Scheduled", "SCHEDULED"], ["Live", "LIVE"], ["Finished", "FINISHED"], ["Postponed", "POSTPONED"], ["Cancelled", "CANCELLED"]];
  return (
    <div className="space-y-7">
      <div><h1 className="text-3xl font-bold">Matches</h1><p className="mt-2 text-zinc-400">World Cup 2026 fixtures and your predictions.</p></div>
      <nav className="flex flex-wrap gap-2">{tabs.map(([label, value]) => <Link key={label} href={value ? `/matches?status=${value}` : "/matches"} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selected === value || (!selected && !value) ? "bg-lime-300 text-slate-950 shadow-sm shadow-lime-950/20" : "border border-emerald-500/20 bg-slate-950/75 text-emerald-100 hover:bg-emerald-500/10"}`}>{label}</Link>)}</nav>
      {matches.length ? <div className="space-y-8">{groups.map((group) => <section key={group.date} className="space-y-4"><h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{group.date}</h2><div className="grid gap-4 lg:grid-cols-2">{group.matches.map(({ predictions, ...match }) => <MatchCard key={match.id} match={{ ...match, prediction: predictions[0] ?? null }} />)}</div></section>)}</div> : <div className="rounded-lg border border-zinc-800 p-12 text-center text-zinc-400">No matches found.</div>}
    </div>
  );
}
