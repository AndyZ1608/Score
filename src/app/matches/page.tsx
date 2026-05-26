import Link from "next/link";
import { MatchStatus } from "@prisma/client";
import { MatchCard } from "@/components/match-card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { userId } = await requireAuth();
  const { status } = await searchParams;
  const selected = Object.values(MatchStatus).includes(status as MatchStatus) ? status as MatchStatus : undefined;
  const matches = await prisma.match.findMany({
    where: selected ? { status: selected } : {},
    orderBy: { kickoffTime: "asc" },
    include: { predictions: { where: { userId }, take: 1 } },
  });
  const groups = matches.reduce<Array<{ date: string; matches: typeof matches }>>((all, match) => {
    const date = match.kickoffTime.toISOString().slice(0, 10);
    const group = all.find((entry) => entry.date === date);
    if (group) group.matches.push(match);
    else all.push({ date, matches: [match] });
    return all;
  }, []);
  const tabs: Array<[string, string | undefined]> = [["All", undefined], ["Scheduled", "SCHEDULED"], ["Live", "LIVE"], ["Finished", "FINISHED"]];
  return (
    <div className="space-y-7">
      <div><h1 className="text-3xl font-bold">Matches</h1><p className="mt-2 text-zinc-400">World Cup 2026 fixtures and your predictions.</p></div>
      <nav className="flex flex-wrap gap-2">{tabs.map(([label, value]) => <Link key={label} href={value ? `/matches?status=${value}` : "/matches"} className={`rounded-full px-4 py-2 text-sm ${selected === value || (!selected && !value) ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-300"}`}>{label}</Link>)}</nav>
      {matches.length ? <div className="space-y-8">{groups.map((group) => <section key={group.date} className="space-y-4"><h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{group.date}</h2><div className="grid gap-4 lg:grid-cols-2">{group.matches.map(({ predictions, ...match }) => <MatchCard key={match.id} match={{ ...match, prediction: predictions[0] ?? null }} />)}</div></section>)}</div> : <div className="rounded-lg border border-zinc-800 p-12 text-center text-zinc-400">No matches found.</div>}
    </div>
  );
}
