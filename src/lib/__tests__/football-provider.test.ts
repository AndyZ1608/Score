import { afterEach, describe, expect, it, vi } from "vitest";
import { MatchStatus } from "@prisma/client";
import { mockFixtures, TheSportsDBProvider } from "@/lib/football-provider";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

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

describe("TheSportsDBProvider", () => {
  it("calls the configured season endpoint and maps events", async () => {
    vi.stubEnv("THESPORTSDB_API_KEY", "123");
    vi.stubEnv("THESPORTSDB_LEAGUE_ID", "4429");
    vi.stubEnv("THESPORTSDB_SEASON", "2026");
    vi.stubEnv("THESPORTSDB_BASE_URL", "https://www.thesportsdb.com/api/v1/json");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          {
            idEvent: "2391728",
            strHomeTeam: "Mexico",
            strAwayTeam: "South Africa",
            strHomeTeamBadge: "https://example.com/home.png",
            strAwayTeamBadge: "https://example.com/away.png",
            strTimestamp: "2026-06-11T19:00:00",
            strVenue: "Estadio Azteca",
            strCountry: "Mexico",
            intRound: "1",
            intHomeScore: null,
            intAwayScore: null,
            strStatus: "NS",
            strPostponed: "no",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const matches = await new TheSportsDBProvider().fetchMatches();

    expect(fetchMock).toHaveBeenCalledWith("https://www.thesportsdb.com/api/v1/json/123/eventsseason.php?id=4429&s=2026", { cache: "no-store" });
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      externalId: "2391728",
      homeTeam: "Mexico",
      awayTeam: "South Africa",
      status: MatchStatus.SCHEDULED,
      source: "thesportsdb",
    });
    expect(matches[0]?.kickoffTime.toISOString()).toBe("2026-06-11T19:00:00.000Z");
  });
});
