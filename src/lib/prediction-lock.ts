const LOCK_WINDOW_MS = 60 * 60 * 1000;
const LOCKED_MESSAGE = "Predictions are locked for this match. Predictions close 1 hour before kickoff.";

function parseKickoff(kickoffAt: Date | string) {
  const kickoff = kickoffAt instanceof Date ? kickoffAt : new Date(kickoffAt);
  return Number.isNaN(kickoff.getTime()) ? null : kickoff;
}

export function getPredictionLockTime(kickoffAt: Date | string): Date {
  const kickoff = parseKickoff(kickoffAt);
  if (!kickoff) return new Date(0);
  return new Date(kickoff.getTime() - LOCK_WINDOW_MS);
}

export function isPredictionLocked(kickoffAt: Date | string, now = new Date()): boolean {
  const kickoff = parseKickoff(kickoffAt);
  if (!kickoff || Number.isNaN(now.getTime())) return true;
  return now.getTime() >= getPredictionLockTime(kickoff).getTime();
}

export function getPredictionLockReason(kickoffAt: Date | string, now = new Date()): string {
  if (isPredictionLocked(kickoffAt, now)) return LOCKED_MESSAGE;
  return "Predictions close 1 hour before kickoff.";
}

export const PREDICTION_LOCKED_MESSAGE = LOCKED_MESSAGE;
