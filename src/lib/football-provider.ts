import { MatchResult, MatchStatus } from "@prisma/client";
import { normalizeMatchStatus } from "./match-status";

export interface ExternalMatch {
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: Date;
  stadium?: string;
  stage?: string;
  groupName?: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  actualResult: MatchResult | null;
  lastUpdatedAt: Date | null;
}

export interface FootballDataProvider {
  fetchMatches(): Promise<ExternalMatch[]>;
}

function result(homeScore: number | null, awayScore: number | null) {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return MatchResult.HOME;
  if (homeScore < awayScore) return MatchResult.AWAY;
  return MatchResult.DRAW;
}

function normalizeMockMatch(match: ExternalMatch, now = new Date()): ExternalMatch {
  if (match.kickoffTime > now && match.status !== MatchStatus.POSTPONED && match.status !== MatchStatus.CANCELLED) {
    return {
      ...match,
      status: MatchStatus.SCHEDULED,
      homeScore: null,
      awayScore: null,
      minute: null,
      actualResult: null,
      lastUpdatedAt: match.lastUpdatedAt ?? now,
    };
  }

  if (match.status !== MatchStatus.FINISHED) {
    return {
      ...match,
      actualResult: null,
      lastUpdatedAt: match.lastUpdatedAt ?? now,
    };
  }

  return {
    ...match,
    minute: null,
    lastUpdatedAt: match.lastUpdatedAt ?? now,
  };
}

const fixtures = [
  ["M001", "Mexico", "South Africa", "2026-06-11T19:00:00Z", "Estadio Azteca", "Group Stage", "A", "FINISHED", 2, 1, null],
  ["M002", "Canada", "Switzerland", "2026-06-12T19:00:00Z", "BMO Field", "Group Stage", "B", "FINISHED", 1, 1, null],
  ["M003", "USA", "Japan", "2026-06-12T22:00:00Z", "SoFi Stadium", "Group Stage", "C", "FINISHED", 0, 2, null],
  ["M004", "Argentina", "Morocco", "2026-06-13T19:00:00Z", "MetLife Stadium", "Group Stage", "D", "FINISHED", 3, 0, null],
  ["M005", "France", "Senegal", "2026-06-13T22:00:00Z", "Mercedes-Benz Stadium", "Group Stage", "E", "LIVE", 1, 0, 67],
  ["M006", "Brazil", "Serbia", "2026-06-14T19:00:00Z", "Hard Rock Stadium", "Group Stage", "F", "LIVE", 0, 0, 23],
  ["M007", "England", "Korea Republic", "2026-06-14T22:00:00Z", "AT&T Stadium", "Group Stage", "G", "SCHEDULED", null, null, null],
  ["M008", "Spain", "Ghana", "2026-06-15T19:00:00Z", "Levi's Stadium", "Group Stage", "H", "SCHEDULED", null, null, null],
  ["M009", "Germany", "Ecuador", "2026-06-15T22:00:00Z", "NRG Stadium", "Group Stage", "I", "SCHEDULED", null, null, null],
  ["M010", "Portugal", "Australia", "2026-06-16T19:00:00Z", "Lumen Field", "Group Stage", "J", "SCHEDULED", null, null, null],
  ["M011", "Netherlands", "Colombia", "2026-06-16T22:00:00Z", "Gillette Stadium", "Group Stage", "K", "SCHEDULED", null, null, null],
  ["M012", "Belgium", "Uruguay", "2026-06-17T19:00:00Z", "Lincoln Financial Field", "Group Stage", "L", "POSTPONED", null, null, null],
  ["M013", "South Africa", "Canada", "2026-06-18T19:00:00Z", "BC Place", "Group Stage", "A", "SCHEDULED", null, null, null],
  ["M014", "Switzerland", "USA", "2026-06-18T22:00:00Z", "Arrowhead Stadium", "Group Stage", "B", "SCHEDULED", null, null, null],
  ["M015", "Japan", "Argentina", "2026-06-19T19:00:00Z", "MetLife Stadium", "Group Stage", "C", "SCHEDULED", null, null, null],
  ["M016", "Morocco", "France", "2026-06-19T22:00:00Z", "SoFi Stadium", "Group Stage", "D", "SCHEDULED", null, null, null],
  ["M017", "Senegal", "Brazil", "2026-06-20T19:00:00Z", "Hard Rock Stadium", "Group Stage", "E", "SCHEDULED", null, null, null],
  ["M018", "Serbia", "England", "2026-06-20T22:00:00Z", "AT&T Stadium", "Group Stage", "F", "SCHEDULED", null, null, null],
  ["M019", "Korea Republic", "Spain", "2026-06-21T19:00:00Z", "NRG Stadium", "Group Stage", "G", "SCHEDULED", null, null, null],
  ["M020", "Ghana", "Germany", "2026-06-21T22:00:00Z", "Lumen Field", "Group Stage", "H", "SCHEDULED", null, null, null],
  ["M021", "Ecuador", "Portugal", "2026-06-22T19:00:00Z", "Levi's Stadium", "Group Stage", "I", "SCHEDULED", null, null, null],
  ["M022", "Australia", "Netherlands", "2026-06-22T22:00:00Z", "Gillette Stadium", "Group Stage", "J", "SCHEDULED", null, null, null],
] as const;

export function mockFixtures(now = new Date()): ExternalMatch[] {
  return fixtures.map(([externalId, homeTeam, awayTeam, date, stadium, stage, groupName, status, homeScore, awayScore, minute]) =>
    normalizeMockMatch(
      {
        externalId,
        homeTeam,
        awayTeam,
        kickoffTime: new Date(date),
        stadium,
        stage,
        groupName,
        status: normalizeMatchStatus(status),
        homeScore,
        awayScore,
        minute,
        actualResult: status === "FINISHED" ? result(homeScore, awayScore) : null,
        lastUpdatedAt: now,
      },
      now,
    ),
  );
}

export class MockProvider implements FootballDataProvider {
  async fetchMatches() {
    return mockFixtures();
  }
}

export class FootballDataOrgProvider implements FootballDataProvider {
  async fetchMatches(): Promise<ExternalMatch[]> {
    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) throw new Error("FOOTBALL_API_KEY is required when FOOTBALL_API_PROVIDER=football-data-org");
    const competition = process.env.FOOTBALL_COMPETITION_CODE || "WC";
    const season = process.env.WORLD_CUP_SEASON || "2026";
    const baseUrl = process.env.FOOTBALL_API_BASE_URL || "https://api.football-data.org/v4";
    const response = await fetch(`${baseUrl}/competitions/${competition}/matches?season=${season}`, {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`football-data.org request failed (${response.status})`);
    const payload = (await response.json()) as { matches?: Record<string, unknown>[] };
    if (!Array.isArray(payload.matches)) throw new Error("football-data.org returned invalid matches payload");

    return payload.matches.map((raw) => {
      const score = raw.score as { fullTime?: { home?: number | null; away?: number | null } } | undefined;
      const homeScore = score?.fullTime?.home ?? null;
      const awayScore = score?.fullTime?.away ?? null;
      const status = normalizeMatchStatus(String(raw.status));
      const minute = getProviderMinute(raw);
      const lastUpdatedAt = raw.lastUpdated ? new Date(String(raw.lastUpdated)) : new Date();

      return {
        externalId: String(raw.id),
        homeTeam: String((raw.homeTeam as { name?: string })?.name ?? "TBD"),
        awayTeam: String((raw.awayTeam as { name?: string })?.name ?? "TBD"),
        kickoffTime: new Date(String(raw.utcDate)),
        stage: raw.stage ? String(raw.stage) : undefined,
        groupName: raw.group ? String(raw.group) : undefined,
        status,
        homeScore,
        awayScore,
        minute: status === MatchStatus.LIVE ? minute : null,
        actualResult: status === MatchStatus.FINISHED ? result(homeScore, awayScore) : null,
        lastUpdatedAt,
      };
    });
  }
}

function getProviderMinute(raw: Record<string, unknown>): number | null {
  const rawMinute = raw.minute ?? raw.matchdayMinute ?? raw.elapsed;
  const minute = typeof rawMinute === "number" ? rawMinute : Number(rawMinute);
  return Number.isFinite(minute) ? minute : null;
}

export function getProvider(): FootballDataProvider {
  switch (process.env.FOOTBALL_API_PROVIDER || "mock") {
    case "mock":
      return new MockProvider();
    case "football-data-org":
      return new FootballDataOrgProvider();
    default:
      throw new Error("FOOTBALL_API_PROVIDER must be mock or football-data-org");
  }
}
