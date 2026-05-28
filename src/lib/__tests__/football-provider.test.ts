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

  it("can simulate live and finished matches when the clock is inside the fixture window", () => {
    const matches = mockFixtures(new Date("2026-06-13T22:30:00Z"));
    const finished = matches.find((match) => match.externalId === "M001");
    const live = matches.find((match) => match.externalId === "M005");

    expect(finished?.status).toBe(MatchStatus.FINISHED);
    expect(finished?.homeScore).toBe(2);
    expect(finished?.awayScore).toBe(1);
    expect(live?.status).toBe(MatchStatus.LIVE);
    expect(live?.homeScore).toBe(1);
    expect(live?.awayScore).toBe(0);
    expect(live?.minute).toBe(67);
  });
});
