import { describe, expect, it } from "vitest";
import { AVATAR_COUNT, getAvatarPathById, getFallbackAvatarId, getUserAvatarPath, isValidAvatarId } from "@/lib/user-avatar";

describe("user avatar helpers", () => {
  it("validates avatar IDs strictly", () => {
    expect(isValidAvatarId(1)).toBe(true);
    expect(isValidAvatarId(20)).toBe(true);
    expect(isValidAvatarId(0)).toBe(false);
    expect(isValidAvatarId(21)).toBe(false);
    expect(isValidAvatarId("1")).toBe(false);
  });

  it("builds local avatar paths", () => {
    expect(AVATAR_COUNT).toBe(20);
    expect(getAvatarPathById(5)).toBe("/assets/avatar/ramdom5.jpg");
  });

  it("returns stable fallback IDs within range", () => {
    const first = getFallbackAvatarId("score-user");
    const second = getFallbackAvatarId("score-user");
    expect(first).toBe(second);
    expect(first).toBeGreaterThanOrEqual(1);
    expect(first).toBeLessThanOrEqual(20);
  });

  it("uses selected avatar when valid and fallback otherwise", () => {
    expect(getUserAvatarPath({ id: "user-1", username: "alice", avatarId: 7 })).toBe("/assets/avatar/ramdom7.jpg");
    expect(getUserAvatarPath({ id: null, username: null, avatarId: null })).toBe("/assets/avatar/ramdom1.jpg");
  });
});
