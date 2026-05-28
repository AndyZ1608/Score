import { describe, expect, it } from "vitest";
import { MatchStatus } from "@prisma/client";
import { isFinishedMatch, isLiveMatch, normalizeMatchStatus, shouldCalculateScore } from "@/lib/match-status";

describe("match status helpers", () => {
  it("normalizes provider live statuses", () => {
    expect(normalizeMatchStatus("IN_PLAY")).toBe(MatchStatus.LIVE);
    expect(isLiveMatch("PAUSED")).toBe(true);
  });

  it("normalizes finished statuses", () => {
    expect(normalizeMatchStatus("FT")).toBe(MatchStatus.FINISHED);
    expect(isFinishedMatch("FINISHED")).toBe(true);
    expect(shouldCalculateScore("FULL_TIME")).toBe(true);
  });

  it("normalizes cancelled and unknown statuses", () => {
    expect(normalizeMatchStatus("cancelled")).toBe(MatchStatus.CANCELLED);
    expect(normalizeMatchStatus("TIMED")).toBe(MatchStatus.SCHEDULED);
  });
});
