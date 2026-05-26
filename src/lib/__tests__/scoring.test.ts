import { beforeEach, describe, expect, it, vi } from "vitest";
import { MatchResult, MatchStatus } from "@prisma/client";
import { calculatePredictionPoints, calculateScoresForMatch, getResult } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    match: { findUnique: vi.fn(), update: vi.fn() },
    prediction: { findMany: vi.fn(), update: vi.fn() },
    $transaction: vi.fn((operations) => Promise.all(operations)),
  },
}));

const finished = { status: MatchStatus.FINISHED, homeScore: 2, awayScore: 1, actualResult: MatchResult.HOME };
function prediction(home: number, away: number) {
  return { predictedHomeScore: home, predictedAwayScore: away, predictedResult: getResult(home, away) };
}

describe("getResult", () => {
  it("returns HOME", () => expect(getResult(2, 1)).toBe(MatchResult.HOME));
  it("returns DRAW", () => expect(getResult(0, 0)).toBe(MatchResult.DRAW));
  it("returns AWAY", () => expect(getResult(0, 2)).toBe(MatchResult.AWAY));
});

describe("calculatePredictionPoints", () => {
  it("awards four points for exact score", () => expect(calculatePredictionPoints(prediction(2, 1), finished)).toEqual({ pointsResult: 1, pointsExactScore: 3, totalPoints: 4, isCalculated: true }));
  it("awards one point for result only", () => expect(calculatePredictionPoints(prediction(3, 0), finished).totalPoints).toBe(1));
  it("awards zero for wrong result", () => expect(calculatePredictionPoints(prediction(0, 1), finished).totalPoints).toBe(0));
  it("awards four points for an exact 0-0 draw", () => expect(calculatePredictionPoints(prediction(0, 0), { ...finished, homeScore: 0, awayScore: 0, actualResult: MatchResult.DRAW }).totalPoints).toBe(4));
  it("does not calculate an unfinished match", () => expect(calculatePredictionPoints(prediction(1, 0), { ...finished, status: MatchStatus.LIVE }).isCalculated).toBe(false));
});

describe("idempotent persistence", () => {
  beforeEach(() => vi.clearAllMocks());

  it("overwrites the same totals when recalculated", async () => {
    vi.mocked(prisma.match.findUnique).mockResolvedValue({ id: "match", ...finished } as never);
    vi.mocked(prisma.prediction.findMany).mockResolvedValue([{ id: "prediction", ...prediction(2, 1) }] as never);
    await calculateScoresForMatch("match");
    await calculateScoresForMatch("match");
    expect(prisma.prediction.update).toHaveBeenCalledTimes(2);
    expect(prisma.prediction.update).toHaveBeenLastCalledWith({
      where: { id: "prediction" },
      data: { pointsResult: 1, pointsExactScore: 3, totalPoints: 4, isCalculated: true },
    });
  });
});
