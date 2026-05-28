import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserAvatar } from "@/components/user-avatar";

export interface LeaderboardRow {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  correctResults: number;
  exactScores: number;
  totalPredictions: number;
}

export function LeaderboardTable({ rows, currentUserId }: { rows: LeaderboardRow[]; currentUserId: string }) {
  if (!rows.length) return <p className="rounded-lg border border-zinc-800 p-10 text-center text-zinc-400">No players yet.</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <Table>
        <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Player</TableHead><TableHead className="hidden sm:table-cell">Predictions</TableHead><TableHead className="hidden md:table-cell">Correct</TableHead><TableHead className="hidden md:table-cell">Exact</TableHead><TableHead className="text-right">Points</TableHead></TableRow></TableHeader>
        <TableBody>
          {rows.map((row) => <TableRow key={row.userId} className={cn(row.userId === currentUserId && "bg-indigo-500/10")}>
            <TableCell className="font-semibold">#{row.rank}</TableCell>
            <TableCell><div className="flex items-center gap-3"><UserAvatar seed={row.userId} name={row.username} size="sm" /><span>{row.username}{row.userId === currentUserId && <small className="ml-2 text-emerald-300">(you)</small>}</span></div></TableCell>
            <TableCell className="hidden sm:table-cell">{row.totalPredictions}</TableCell>
            <TableCell className="hidden md:table-cell">{row.correctResults}</TableCell>
            <TableCell className="hidden md:table-cell">{row.exactScores}</TableCell>
            <TableCell className="text-right font-bold text-emerald-400">{row.totalPoints}</TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </div>
  );
}
