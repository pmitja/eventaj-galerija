import { describe, expect, it } from "vitest";
import { createEventSchema } from "./events";

describe("createEventSchema", () => {
  it("rejects an end before the start", () => {
    const result = createEventSchema.safeParse({
      name: "Dogodek",
      startsAt: "2026-07-19T10:00:00+02:00",
      endsAt: "2026-07-19T09:00:00+02:00",
      timezone: "Europe/Ljubljana",
    });
    expect(result.success).toBe(false);
  });
});
