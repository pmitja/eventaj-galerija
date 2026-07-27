import { describe, expect, it, vi } from "vitest";
import { nextSlideshowIndex, resolveStableSlideshowToken } from "./slideshow";

describe("slideshow navigation", () => {
  it("wraps forward and backward without leaving the playlist", () => {
    expect(nextSlideshowIndex(2, 3)).toBe(0);
    expect(nextSlideshowIndex(0, 3, -1)).toBe(2);
    expect(nextSlideshowIndex(4, 0)).toBe(0);
  });
});

describe("stable slideshow token", () => {
  it("keeps the existing event token instead of generating a new one", () => {
    const createToken = vi.fn(() => "new-token");

    expect(resolveStableSlideshowToken("existing-token", createToken)).toBe("existing-token");
    expect(createToken).not.toHaveBeenCalled();
  });

  it("creates a token only when an event does not have one yet", () => {
    expect(resolveStableSlideshowToken(null, () => "first-token")).toBe("first-token");
  });
});
