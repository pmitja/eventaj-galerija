import { describe, expect, it } from "vitest";
import {
  AI_BEST_PHOTOS_LIMIT,
  AI_BEST_PHOTOS_PRICE_CENTS,
  EVENT_PRICE_CENTS,
  checkoutTotalCents,
} from "./billing";

describe("billing rules", () => {
  it("charges 35 EUR for one event", () => {
    expect(EVENT_PRICE_CENTS).toBe(3_500);
    expect(checkoutTotalCents(false)).toBe(3_500);
  });

  it("adds 15 EUR for AI Best Photos up to 3,000 photos", () => {
    expect(AI_BEST_PHOTOS_PRICE_CENTS).toBe(1_500);
    expect(AI_BEST_PHOTOS_LIMIT).toBe(3_000);
    expect(checkoutTotalCents(true)).toBe(5_000);
  });
});
