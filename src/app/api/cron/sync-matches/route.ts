import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { getProvider } from "@/lib/football-provider";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const providerName = process.env.FOOTBALL_API_PROVIDER || "mock";
  try {
    const matches = await getProvider().fetchMatches();
    for (const match of matches) {
      const savedMatch = await prisma.match.upsert({
        where: { externalId: match.externalId },
        update: match,
        create: match,
      });
      if (match.status !== "FINISHED") {
        await prisma.prediction.updateMany({
          where: { matchId: savedMatch.id },
          data: { pointsResult: 0, pointsExactScore: 0, totalPoints: 0, isCalculated: false },
        });
      }
    }
    await prisma.syncLog.create({
      data: { provider: providerName, jobType: "SYNC_MATCHES", status: "SUCCESS", message: `${matches.length} matches synced` },
    });
    return NextResponse.json({ provider: providerName, matchesSynced: matches.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await prisma.syncLog.create({ data: { provider: providerName, jobType: "SYNC_MATCHES", status: "FAILED", message } });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
