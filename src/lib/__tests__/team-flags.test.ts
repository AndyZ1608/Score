import { describe, expect, it } from "vitest";
import { getTeamFlagInfo, normalizeTeamName } from "@/lib/team-flags";

describe("team flag helpers", () => {
  it("normalizes whitespace and casing", () => {
    expect(normalizeTeamName("  Korea   Republic ")).toBe("korea republic");
  });

  it("resolves standard country names through ISO data", () => {
    expect(getTeamFlagInfo("Mexico")?.code).toBe("mx");
    expect(getTeamFlagInfo("South Africa")?.code).toBe("za");
    expect(getTeamFlagInfo("Brazil")?.code).toBe("br");
    expect(getTeamFlagInfo("Argentina")?.code).toBe("ar");
    expect(getTeamFlagInfo("Germany")?.code).toBe("de");
    expect(getTeamFlagInfo("Spain")?.code).toBe("es");
    expect(getTeamFlagInfo("Morocco")?.code).toBe("ma");
    expect(getTeamFlagInfo("Ghana")?.code).toBe("gh");
    expect(getTeamFlagInfo("Australia")?.code).toBe("au");
  });

  it("resolves football-specific aliases", () => {
    expect(getTeamFlagInfo("South Korea")?.code).toBe("kr");
    expect(getTeamFlagInfo("Korea Republic")?.code).toBe("kr");
    expect(getTeamFlagInfo("Czech Republic")?.code).toBe("cz");
    expect(getTeamFlagInfo("Czechia")?.code).toBe("cz");
    expect(getTeamFlagInfo("United States")?.code).toBe("us");
    expect(getTeamFlagInfo("USA")?.code).toBe("us");
    expect(getTeamFlagInfo("England")?.code).toBe("gb-eng");
    expect(getTeamFlagInfo("Scotland")?.code).toBe("gb-sct");
    expect(getTeamFlagInfo("Wales")?.code).toBe("gb-wls");
    expect(getTeamFlagInfo("Vietnam")?.code).toBe("vn");
  });

  it("falls back to null for unknown teams", () => {
    expect(getTeamFlagInfo("Unknown Team")).toBeNull();
  });
});
