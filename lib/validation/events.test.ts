import { describe, expect, it } from "vitest";
import { createEventSchema } from "./events";

describe("createEventSchema", () => {
  const validEvent = {
    name: "Dogodek",
    startsAt: "2026-07-19T10:00:00+02:00",
    endsAt: "2026-07-19T12:00:00+02:00",
    timezone: "Europe/Ljubljana",
    customerName: "Ana Kovač",
    customerEmail: "ANA@example.com",
    packageCode: "advanced",
  };

  it("requires a customer and supported package and normalizes the email", () => {
    const result = createEventSchema.parse(validEvent);
    expect(result.customerEmail).toBe("ana@example.com");
    expect(createEventSchema.safeParse({ ...validEvent, packageCode: "enterprise" }).success).toBe(false);
  });

  it("rejects an end before the start", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      endsAt: "2026-07-19T09:00:00+02:00",
    });
    expect(result.success).toBe(false);
  });
});
