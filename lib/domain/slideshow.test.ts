import { describe, expect, it } from "vitest";
import { nextSlideshowIndex } from "./slideshow";

describe("slideshow navigation", () => {
  it("wraps forward and backward without leaving the playlist", () => {
    expect(nextSlideshowIndex(2, 3)).toBe(0);
    expect(nextSlideshowIndex(0, 3, -1)).toBe(2);
    expect(nextSlideshowIndex(4, 0)).toBe(0);
  });
});
