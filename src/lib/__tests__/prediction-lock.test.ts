import { describe, expect, it } from "vitest";
import { getPredictionLockTime, isPredictionLocked } from "@/lib/prediction-lock";

describe("prediction lock", () => {
  const kickoff = "2026-06-15T13:00:00.000Z";

  it("returns the lock time one hour before kickoff", () => {
    expect(getPredictionLockTime(kickoff).toISOString()).toBe("2026-06-15T12:00:00.000Z");
  });

  it("is open before the lock time", () => {
    expect(isPredictionLocked(kickoff, new Date("2026-06-15T11:59:59.000Z"))).toBe(false);
  });

  it("is locked exactly at the lock time", () => {
    expect(isPredictionLocked(kickoff, new Date("2026-06-15T12:00:00.000Z"))).toBe(true);
  });

  it("is locked at kickoff", () => {
    expect(isPredictionLocked(kickoff, new Date("2026-06-15T13:00:00.000Z"))).toBe(true);
  });

  it("fails closed for invalid kickoff dates", () => {
    expect(isPredictionLocked("not-a-date", new Date("2026-06-15T11:00:00.000Z"))).toBe(true);
  });
});
