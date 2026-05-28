import { MatchResult, MatchStatus } from "@prisma/client";
import { normalizeMatchStatus } from "./match-status";

export interface ExternalMatch {
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  kickoffTime: Date;
  stadium?: string;
  country?: string | null;
  stage?: string;
  groupName?: string;
  round?: string | null;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  actualResult: MatchResult | null;
  lastUpdatedAt: Date | null;
  source: string;
  providerHomeScore: number | null;
  providerAwayScore: number | null;
  providerStatus: MatchStatus;
  providerUpdatedAt: Date | null;
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
        homeTeamLogo: null,
        awayTeamLogo: null,
        country: null,
        round: null,
        status: normalizeMatchStatus(status),
        homeScore,
        awayScore,
        minute,
        actualResult: status === "FINISHED" ? result(homeScore, awayScore) : null,
        lastUpdatedAt: now,
        source: "mock",
        providerHomeScore: homeScore,
        providerAwayScore: awayScore,
        providerStatus: normalizeMatchStatus(status),
        providerUpdatedAt: now,
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
        homeTeamLogo: null,
        awayTeamLogo: null,
        country: null,
        stage: raw.stage ? String(raw.stage) : undefined,
        groupName: raw.group ? String(raw.group) : undefined,
        round: null,
        status,
        homeScore,
        awayScore,
        minute: status === MatchStatus.LIVE ? minute : null,
        actualResult: status === MatchStatus.FINISHED ? result(homeScore, awayScore) : null,
        lastUpdatedAt,
        source: "football-data-org",
        providerHomeScore: homeScore,
        providerAwayScore: awayScore,
        providerStatus: status,
        providerUpdatedAt: lastUpdatedAt,
      };
    });
  }
}

export class TheSportsDBProvider implements FootballDataProvider {
  async fetchMatches(): Promise<ExternalMatch[]> {
    const apiKey = process.env.THESPORTSDB_API_KEY;
    const leagueId = process.env.THESPORTSDB_LEAGUE_ID;
    const season = process.env.THESPORTSDB_SEASON || "2026";
    const baseUrl = process.env.THESPORTSDB_BASE_URL || "https://www.thesportsdb.com/api/v1/json";
    if (!apiKey) throw new Error("THESPORTSDB_API_KEY is required when FOOTBALL_API_PROVIDER=thesportsdb");
    if (!leagueId) throw new Error("THESPORTSDB_LEAGUE_ID is required when FOOTBALL_API_PROVIDER=thesportsdb");

    const response = await fetch(`${baseUrl}/${apiKey}/eventsseason.php?id=${leagueId}&s=${season}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`TheSportsDB request failed (${response.status})`);

    const payload = (await response.json()) as { events?: Record<string, unknown>[] | null };
    const events = payload.events ?? [];
    if (!Array.isArray(events)) throw new Error("TheSportsDB returned invalid events payload");

    return events.map((event) => {
      const homeScore = parseNullableInt(event.intHomeScore);
      const awayScore = parseNullableInt(event.intAwayScore);
      const status = normalizeTheSportsDBStatus(event, homeScore, awayScore);
      const kickoffTime = parseTheSportsDBKickoff(event);
      const lastUpdatedAt = new Date();

      return {
        externalId: String(event.idEvent),
        homeTeam: String(event.strHomeTeam ?? "TBD"),
        awayTeam: String(event.strAwayTeam ?? "TBD"),
        homeTeamLogo: nullableString(event.strHomeTeamBadge),
        awayTeamLogo: nullableString(event.strAwayTeamBadge),
        kickoffTime,
        stadium: nullableString(event.strVenue) ?? undefined,
        country: nullableString(event.strCountry),
        stage: nullableString(event.strLeague) ?? undefined,
        groupName: null,
        round: event.intRound === null || event.intRound === undefined ? null : String(event.intRound),
        status,
        homeScore,
        awayScore,
        minute: status === MatchStatus.LIVE ? getProviderMinute(event) : null,
        actualResult: status === MatchStatus.FINISHED ? result(homeScore, awayScore) : null,
        lastUpdatedAt,
        source: "thesportsdb",
        providerHomeScore: homeScore,
        providerAwayScore: awayScore,
        providerStatus: status,
        providerUpdatedAt: lastUpdatedAt,
      };
    });
  }
}

function normalizeTheSportsDBStatus(event: Record<string, unknown>, homeScore: number | null, awayScore: number | null): MatchStatus {
  const postponed = String(event.strPostponed ?? "").trim().toLowerCase() === "yes";
  if (postponed) return MatchStatus.POSTPONED;
  const status = String(event.strStatus ?? "").trim().toUpperCase();
  if (["PST"].includes(status)) return MatchStatus.POSTPONED;
  if (["CANC", "ABD"].includes(status)) return MatchStatus.CANCELLED;
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE"].includes(status)) return MatchStatus.LIVE;
  if (["FT", "AET", "PEN"].includes(status)) return MatchStatus.FINISHED;
  if (status === "NS") return MatchStatus.SCHEDULED;
  if (homeScore !== null && awayScore !== null) return MatchStatus.FINISHED;
  return normalizeMatchStatus(status || "SCHEDULED");
}

function parseTheSportsDBKickoff(event: Record<string, unknown>): Date {
  const timestamp = nullableString(event.strTimestamp);
  if (timestamp) {
    const normalized = /(?:z|[+-]\d{2}:?\d{2})$/i.test(timestamp) ? timestamp : `${timestamp}Z`;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const date = nullableString(event.dateEvent);
  const time = nullableString(event.strTime) ?? "00:00:00";
  const parsed = new Date(`${date ?? "1970-01-01"}T${time}Z`);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  throw new Error(`Invalid TheSportsDB kickoff for event ${String(event.idEvent ?? "unknown")}`);
}

function parseNullableInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const stringValue = String(value).trim();
  return stringValue ? stringValue : null;
}

function getProviderMinute(raw: Record<string, unknown>): number | null {
  const rawMinute = raw.minute ?? raw.matchdayMinute ?? raw.elapsed;
  const minute = typeof rawMinute === "number" ? rawMinute : Number(rawMinute);
  return Number.isFinite(minute) ? minute : null;
}

export function getProvider(): FootballDataProvider {
  const configuredProvider = process.env.FOOTBALL_API_PROVIDER;
  if (!configuredProvider && process.env.NODE_ENV === "production") {
    throw new Error("FOOTBALL_API_PROVIDER must be configured in production");
  }

  switch (configuredProvider || "mock") {
    case "mock":
      return new MockProvider();
    case "football-data-org":
      return new FootballDataOrgProvider();
    case "thesportsdb":
      return new TheSportsDBProvider();
    default:
      throw new Error("FOOTBALL_API_PROVIDER must be mock, football-data-org, or thesportsdb");
  }
}
