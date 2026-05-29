import type { Prisma } from "@prisma/client";

export function getConfiguredFootballProvider() {
  return process.env.FOOTBALL_API_PROVIDER || "mock";
}

export function assertProviderAllowed() {
  const provider = getConfiguredFootballProvider();
  if (process.env.NODE_ENV === "production" && provider === "mock") {
    throw new Error("FOOTBALL_API_PROVIDER=mock is not allowed in production. Set FOOTBALL_API_PROVIDER=thesportsdb.");
  }
}

export function getTheSportsDBConfig() {
  const config = {
    apiKey: process.env.THESPORTSDB_API_KEY,
    leagueId: process.env.THESPORTSDB_LEAGUE_ID,
    season: process.env.THESPORTSDB_SEASON,
    baseUrl: process.env.THESPORTSDB_BASE_URL,
  };
  const missing = [
    ["THESPORTSDB_API_KEY", config.apiKey],
    ["THESPORTSDB_LEAGUE_ID", config.leagueId],
    ["THESPORTSDB_SEASON", config.season],
    ["THESPORTSDB_BASE_URL", config.baseUrl],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing TheSportsDB env: ${missing.join(", ")}`);
  }

  return config as { apiKey: string; leagueId: string; season: string; baseUrl: string };
}

export function getProviderDebugInfo() {
  const provider = getConfiguredFootballProvider();
  if (provider !== "thesportsdb") return { provider };
  const config = getTheSportsDBConfig();
  return {
    provider,
    baseUrl: config.baseUrl,
    leagueId: config.leagueId,
    season: config.season,
  };
}

export function getActiveMatchWhere(): Prisma.MatchWhereInput {
  const provider = getConfiguredFootballProvider();
  if (process.env.NODE_ENV === "production" && provider === "mock") {
    return { source: "__mock_disabled_in_production__", isArchived: false };
  }
  return provider === "thesportsdb"
    ? { source: "thesportsdb", isArchived: false }
    : { isArchived: false };
}

export function isMatchVisibleForActiveProvider(match: { source: string; isArchived: boolean }) {
  if (match.isArchived) return false;
  const provider = getConfiguredFootballProvider();
  if (process.env.NODE_ENV === "production" && provider === "mock") return false;
  return provider !== "thesportsdb" || match.source === "thesportsdb";
}
