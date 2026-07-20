import { describe, expect, it } from "vitest";
import { checkoutFormSchema, createCheckoutSchema } from "./checkout";

const valid = {
  organizationName: "Studio Sever",
  ownerName: "Nina Novak",
  ownerEmail: "NINA@example.com",
  password: "VarnoGeslo42",
  eventName: "Poletni piknik",
  eventLocation: "Ljubljana",
  startsAt: "2026-08-01T14:00:00.000Z",
  endsAt: "2026-08-01T22:00:00.000Z",
  timezone: "Europe/Ljubljana" as const,
  commentsEnabled: true,
  aiBestPhotos: false,
};

describe("checkout validation", () => {
  it("normalizes the owner email", () => {
    const parsed = createCheckoutSchema.parse(valid);
    expect(parsed.ownerEmail).toBe("nina@example.com");
  });

  it("requires a strong account password when supplied", () => {
    expect(createCheckoutSchema.safeParse({ ...valid, password: "prekratko" }).success).toBe(false);
  });

  it("rejects an event that ends before it starts", () => {
    expect(createCheckoutSchema.safeParse({ ...valid, endsAt: "2026-08-01T12:00:00.000Z" }).success).toBe(false);
  });

  it("requires a strong password in the first-purchase form", () => {
    const result = checkoutFormSchema.safeParse({
      requiresAccount: true,
      organizationName: "Studio Sever",
      ownerName: "Nina Novak",
      ownerEmail: "nina@example.com",
      password: "prekratko",
      eventName: "Poletni piknik",
      eventLocation: "Ljubljana",
      startDate: "2026-08-01",
      startTime: "14:00",
      endDate: "2026-08-01",
      endTime: "22:00",
      commentsEnabled: true,
      aiBestPhotos: false,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === "password")).toBe(true);
  });

  it("allows a signed-in buyer to omit the password", () => {
    expect(checkoutFormSchema.safeParse({
      requiresAccount: false,
      organizationName: "Studio Sever",
      ownerName: "Nina Novak",
      ownerEmail: "nina@example.com",
      password: "",
      eventName: "Poletni piknik",
      eventLocation: "",
      startDate: "2026-08-01",
      startTime: "14:00",
      endDate: "2026-08-01",
      endTime: "22:00",
      commentsEnabled: true,
      aiBestPhotos: false,
    }).success).toBe(true);
  });
});
