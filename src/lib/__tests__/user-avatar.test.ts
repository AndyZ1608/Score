import { describe, expect, it } from "vitest";
import { getUserAvatar } from "@/lib/user-avatar";

describe("getUserAvatar", () => {
  it("returns a stable avatar for the same seed", () => {
    expect(getUserAvatar("alice")).toBe(getUserAvatar("alice"));
  });

  it("uses the local ramdom avatar path", () => {
    expect(getUserAvatar("score-user")).toMatch(/^\/assets\/avatar\/ramdom([1-9]|10)\.jpg$/);
  });

  it("falls back safely for empty seeds", () => {
    expect(getUserAvatar(null)).toBe("/assets/avatar/ramdom1.jpg");
    expect(getUserAvatar(undefined)).toBe("/assets/avatar/ramdom1.jpg");
  });
});
