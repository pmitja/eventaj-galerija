import { describe, expect, it } from "vitest";
import { isStickyCtaVisible } from "./sticky-create-event-cta-state";

describe("isStickyCtaVisible", () => {
  it("remains hidden while the hero CTA is visible", () => {
    expect(isStickyCtaVisible({
      isIntersecting: true,
      triggerBottom: 220,
      rootTop: 68,
    })).toBe(false);
  });

  it("appears after the hero CTA passes behind the sticky header", () => {
    expect(isStickyCtaVisible({
      isIntersecting: false,
      triggerBottom: 68,
      rootTop: 68,
    })).toBe(true);
  });

  it("remains hidden when the hero CTA is still below the viewport", () => {
    expect(isStickyCtaVisible({
      isIntersecting: false,
      triggerBottom: 900,
      rootTop: 68,
    })).toBe(false);
  });
});
