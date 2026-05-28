import { describe, expect, it } from "vitest";
import { getTeamFlag, normalizeTeamName } from "@/lib/team-flags";

describe("team flag helpers", () => {
  it("normalizes whitespace and casing", () => {
    expect(normalizeTeamName("  Korea   Republic ")).toBe("korea republic");
  });

  it("returns flags for mock teams", () => {
    expect(getTeamFlag("Argentina")).toBe("🇦🇷");
    expect(getTeamFlag("Brazil")).toBe("🇧🇷");
    expect(getTeamFlag("USA")).toBe("🇺🇸");
    expect(getTeamFlag("Korea Republic")).toBe("🇰🇷");
  });

  it("falls back to null for unknown teams", () => {
    expect(getTeamFlag("TBD")).toBeNull();
  });
});
