import { MatchStatus } from "@prisma/client";

export function normalizeMatchStatus(providerStatus: string): MatchStatus {
  const status = providerStatus.trim().toUpperCase();
  if (["SCHEDULED", "UPCOMING", "TIMED", "NOT_STARTED", "NS"].includes(status)) return MatchStatus.SCHEDULED;
  if (["LIVE", "IN_PLAY", "INPLAY", "PAUSED", "HALFTIME", "HT"].includes(status)) return MatchStatus.LIVE;
  if (["FINISHED", "FT", "FULL_TIME", "FULLTIME", "AWARDED"].includes(status)) return MatchStatus.FINISHED;
  if (["POSTPONED", "SUSPENDED"].includes(status)) return MatchStatus.POSTPONED;
  if (["CANCELLED", "CANCELED"].includes(status)) return MatchStatus.CANCELLED;
  return MatchStatus.SCHEDULED;
}

export function isLiveMatch(status: string): boolean {
  return normalizeMatchStatus(status) === MatchStatus.LIVE;
}

export function isFinishedMatch(status: string): boolean {
  return normalizeMatchStatus(status) === MatchStatus.FINISHED;
}

export function shouldCalculateScore(status: string): boolean {
  return isFinishedMatch(status);
}
