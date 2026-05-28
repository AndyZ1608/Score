import { describe, expect, it } from "vitest";
import { formatMatchDate, formatMatchDateTime, formatMatchTime } from "@/lib/date-format";

describe("match date formatting", () => {
  it("formats UTC kickoff in Asia/Bangkok time", () => {
    const kickoff = "2026-06-15T13:00:00.000Z";

    expect(formatMatchTime(kickoff)).toBe("20:00");
    expect(formatMatchDate(kickoff)).toBe("15/06/2026");
    expect(formatMatchDateTime(kickoff)).toBe("20:00, 15/06/2026 (GMT+7)");
  });
});
