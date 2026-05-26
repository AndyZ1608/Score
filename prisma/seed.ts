import bcrypt from "bcryptjs";
import { MatchResult, PrismaClient } from "@prisma/client";
import { mockFixtures } from "../src/lib/football-provider";

const prisma = new PrismaClient();

function getResult(home: number, away: number) {
  if (home > away) return MatchResult.HOME;
  if (home < away) return MatchResult.AWAY;
  return MatchResult.DRAW;
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  const users = await Promise.all(
    ["testuser", "alice", "bob"].map((username) =>
      prisma.user.upsert({ where: { username }, update: {}, create: { username, passwordHash } }),
    ),
  );

  for (const fixture of mockFixtures()) {
    await prisma.match.upsert({
      where: { externalId: fixture.externalId },
      update: {},
      create: fixture,
    });
  }

  const matches = await prisma.match.findMany({ where: { externalId: { in: ["M001", "M002", "M003", "M004", "M007"] } } });
  const byExternalId = new Map(matches.map((match) => [match.externalId, match]));
  const samples = [
    [0, "M001", 2, 1],
    [0, "M002", 0, 0],
    [0, "M007", 2, 0],
    [1, "M001", 1, 0],
    [1, "M002", 1, 1],
    [1, "M003", 0, 2],
    [2, "M001", 0, 1],
    [2, "M003", 1, 2],
    [2, "M004", 3, 0],
  ] as const;

  for (const [userIndex, externalId, home, away] of samples) {
    const user = users[userIndex];
    const match = byExternalId.get(externalId);
    if (!match) continue;
    const finished = match.status === "FINISHED" && match.homeScore !== null && match.awayScore !== null;
    const actualResult = finished ? getResult(match.homeScore!, match.awayScore!) : null;
    const predictedResult = getResult(home, away);
    const pointsResult = finished && predictedResult === actualResult ? 1 : 0;
    const pointsExactScore = finished && home === match.homeScore && away === match.awayScore ? 3 : 0;
    await prisma.prediction.upsert({
      where: { userId_matchId: { userId: user.id, matchId: match.id } },
      update: {},
      create: {
        userId: user.id,
        matchId: match.id,
        predictedHomeScore: home,
        predictedAwayScore: away,
        predictedResult,
        pointsResult,
        pointsExactScore,
        totalPoints: pointsResult + pointsExactScore,
        isCalculated: finished,
      },
    });
  }
  console.log("Seed complete: testuser / password123");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(() => prisma.$disconnect());
