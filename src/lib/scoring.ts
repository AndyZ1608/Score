import { MatchResult, MatchStatus, type Match, type Prediction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ScoredPrediction = Pick<Prediction, "predictedHomeScore" | "predictedAwayScore" | "predictedResult">;
type CompletedMatch = Pick<Match, "status" | "homeScore" | "awayScore" | "actualResult">;

export function getResult(home: number, away: number): MatchResult {
  if (home > away) return MatchResult.HOME;
  if (home < away) return MatchResult.AWAY;
  return MatchResult.DRAW;
}

export function calculatePredictionPoints(prediction: ScoredPrediction, match: CompletedMatch) {
  if (match.status !== MatchStatus.FINISHED || match.homeScore === null || match.awayScore === null) {
    return { pointsResult: 0, pointsExactScore: 0, totalPoints: 0, isCalculated: false };
  }

  const actualResult = match.actualResult ?? getResult(match.homeScore, match.awayScore);
  const pointsResult = prediction.predictedResult === actualResult ? 1 : 0;
  const pointsExactScore =
    prediction.predictedHomeScore === match.homeScore && prediction.predictedAwayScore === match.awayScore ? 3 : 0;

  return {
    pointsResult,
    pointsExactScore,
    totalPoints: pointsResult + pointsExactScore,
    isCalculated: true,
  };
}

export async function calculateScoresForMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error(`Match with ID ${matchId} not found`);
  if (match.status !== MatchStatus.FINISHED || match.homeScore === null || match.awayScore === null) {
    return { matchId, calculated: 0, updatedUsers: 0, updatedUserIds: [] as string[] };
  }

  const actualResult = getResult(match.homeScore, match.awayScore);
  if (match.actualResult !== actualResult) {
    await prisma.match.update({ where: { id: matchId }, data: { actualResult } });
  }

  const predictions = await prisma.prediction.findMany({ where: { matchId } });
  await prisma.$transaction(
    predictions.map((prediction) =>
      prisma.prediction.update({
        where: { id: prediction.id },
        data: calculatePredictionPoints(prediction, { ...match, actualResult }),
      }),
    ),
  );

  const updatedUserIds = Array.from(new Set(predictions.map((prediction) => prediction.userId)));
  return { matchId, calculated: predictions.length, updatedUsers: updatedUserIds.length, updatedUserIds };
}

export async function calculateAllFinishedMatches() {
  const matches = await prisma.match.findMany({
    where: { status: MatchStatus.FINISHED, homeScore: { not: null }, awayScore: { not: null } },
    select: { id: true },
  });
  let predictionsCalculated = 0;
  const updatedUserIds = new Set<string>();
  let matchesCalculated = 0;
  const errors: string[] = [];

  for (const match of matches) {
    try {
      const result = await calculateScoresForMatch(match.id);
      predictionsCalculated += result.calculated;
      result.updatedUserIds.forEach((userId) => updatedUserIds.add(userId));
      matchesCalculated += 1;
    } catch (error) {
      errors.push(`${match.id}: ${error instanceof Error ? error.message : "Unknown calculation error"}`);
    }
  }

  return {
    processedMatches: matchesCalculated,
    updatedPredictions: predictionsCalculated,
    updatedUsers: updatedUserIds.size,
    errors,
    matchesCalculated,
    predictionsCalculated,
  };
}
