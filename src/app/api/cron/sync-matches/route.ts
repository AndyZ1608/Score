import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { type ExternalMatch, getProvider } from "@/lib/football-provider";
import { prisma } from "@/lib/prisma";
import { calculateScoresForMatch } from "@/lib/scoring";
import { shouldCalculateScore } from "@/lib/match-status";

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const providerName = process.env.FOOTBALL_API_PROVIDER || "unconfigured";
  try {
    const matches = await getProvider().fetchMatches();
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let scoresCalculated = 0;
    const errors: string[] = [];

    for (const match of matches) {
      try {
        const existing = await prisma.match.findUnique({ where: { externalId: match.externalId } });
        const providerData = toProviderMatchData(match);
        const canonicalData = existing?.resultSource === "ADMIN" ? {} : toCanonicalMatchData(match);
        const savedMatch = existing
          ? await prisma.match.update({
              where: { id: existing.id },
              data: { ...providerData, ...canonicalData },
            })
          : await prisma.match.create({
              data: { ...providerData, ...toCanonicalMatchData(match) },
            });

        if (existing) updated += 1;
        else created += 1;

        if (shouldCalculateScore(savedMatch.status)) {
          const result = await calculateScoresForMatch(savedMatch.id);
          scoresCalculated += result.calculated;
        } else {
          await prisma.prediction.updateMany({
            where: { matchId: savedMatch.id },
            data: { pointsResult: 0, pointsExactScore: 0, totalPoints: 0, isCalculated: false },
          });
        }
      } catch (error) {
        skipped += 1;
        errors.push(`${match.externalId}: ${error instanceof Error ? error.message : "Unknown sync error"}`);
      }
    }

    await prisma.syncLog.create({
      data: { provider: providerName, jobType: "SYNC_MATCHES", status: errors.length ? "PARTIAL_SUCCESS" : "SUCCESS", message: `${matches.length} fetched; ${created} created; ${updated} updated; ${skipped} skipped; ${scoresCalculated} predictions calculated` },
    });
    return NextResponse.json({ provider: providerName, fetched: matches.length, created, updated, skipped, errors, scoresCalculated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await prisma.syncLog.create({ data: { provider: providerName, jobType: "SYNC_MATCHES", status: "FAILED", message } });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function toProviderMatchData(match: ExternalMatch) {
  return {
    externalId: match.externalId,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeTeamLogo: match.homeTeamLogo ?? null,
    awayTeamLogo: match.awayTeamLogo ?? null,
    kickoffTime: match.kickoffTime,
    stadium: match.stadium ?? null,
    country: match.country ?? null,
    stage: match.stage ?? null,
    groupName: match.groupName ?? null,
    round: match.round ?? null,
    source: match.source,
    providerHomeScore: match.providerHomeScore,
    providerAwayScore: match.providerAwayScore,
    providerStatus: match.providerStatus,
    providerUpdatedAt: match.providerUpdatedAt,
    lastSyncedAt: match.lastUpdatedAt,
  };
}

function toCanonicalMatchData(match: ExternalMatch) {
  return {
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    minute: match.minute,
    actualResult: match.actualResult,
    resultSource: "PROVIDER",
  };
}
