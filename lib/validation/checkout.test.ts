import { describe, expect, it } from "vitest";
import { checkoutFormSchema, createCheckoutSchema } from "./checkout";

const valid = {
  organizationName: "Studio Sever",
  ownerName: "Nina Novak",
  ownerEmail: "NINA@example.com",
  eventName: "Poletni piknik",
  eventLocation: "Ljubljana",
  startsAt: "2026-08-01T14:00:00.000Z",
  endsAt: "2026-08-01T22:00:00.000Z",
  timezone: "Europe/Ljubljana" as const,
  commentsEnabled: true,
  aiBestPhotos: false,
  faceCollections: false,
};

describe("checkout validation", () => {
  it("normalizes the owner email", () => {
    const parsed = createCheckoutSchema.parse(valid);
    expect(parsed.ownerEmail).toBe("nina@example.com");
  });

  it("rejects an event that ends before it starts", () => {
    expect(createCheckoutSchema.safeParse({ ...valid, endsAt: "2026-08-01T12:00:00.000Z" }).success).toBe(false);
  });

  it("accepts a public purchase without account credentials", () => {
    expect(checkoutFormSchema.safeParse({
      organizationName: "Studio Sever",
      ownerName: "Nina Novak",
      ownerEmail: "nina@example.com",
      eventName: "Poletni piknik",
      eventLocation: "",
      startDate: "2026-08-01",
      startTime: "14:00",
      endDate: "2026-08-01",
      endTime: "22:00",
      commentsEnabled: true,
      aiBestPhotos: false,
      faceCollections: false,
    }).success).toBe(true);
  });
});
