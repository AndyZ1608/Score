import { describe, expect, it } from "vitest";
import { MatchStatus } from "@prisma/client";
import { mockFixtures } from "@/lib/football-provider";

describe("mockFixtures", () => {
  it("does not expose scores for fixtures that have not kicked off yet", () => {
    const matches = mockFixtures(new Date("2026-05-28T00:00:00Z"));
    const futureMatches = matches.filter((match) => match.kickoffTime > new Date("2026-05-28T00:00:00Z"));

    expect(futureMatches.length).toBeGreaterThan(0);
    for (const match of futureMatches) {
      expect(match.homeScore).toBeNull();
      expect(match.awayScore).toBeNull();
      expect(match.actualResult).toBeNull();
      if (match.status !== MatchStatus.POSTPONED) {
        expect(match.status).toBe(MatchStatus.SCHEDULED);
      }
    }
  });
});
