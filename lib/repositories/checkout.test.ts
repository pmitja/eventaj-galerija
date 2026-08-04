import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  queries: [] as string[],
  bindings: [] as Array<{ sql: string; values: unknown[] }>,
  createStripeCheckout: vi.fn(),
}));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    PUBLIC_APP_URL: "https://gallery.example.test",
    PUBLIC_APP_URL_EN: "https://gallery-en.example.test",
    DB: {
      prepare: (sql: string) => {
        state.queries.push(sql);
        return {
          bind: (...values: unknown[]) => {
            state.bindings.push({ sql, values });
            return {
            first: vi.fn().mockResolvedValue(sql.includes("COUNT(*)") ? { count: 0 } : null),
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
            };
          },
        };
      },
    },
  }),
}));

vi.mock("@/lib/billing/stripe", () => ({
  createStripeCheckout: state.createStripeCheckout,
  retrieveStripeCheckout: vi.fn(),
}));

import { createCheckoutOrder } from "./checkout";

describe("checkout rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.queries.length = 0;
    state.bindings.length = 0;
    state.createStripeCheckout.mockResolvedValue({ id: "cs_test_1", url: "https://checkout.stripe.test/session" });
  });

  it("counts only attempts that reached a Stripe Checkout session", async () => {
    await createCheckoutOrder({
      organizationName: "Studio Sever",
      ownerName: "Mitja Test",
      ownerEmail: "mitja@example.com",
      eventName: "Testni dogodek",
      eventLocation: "Ljubljana",
      startsAt: "2026-08-01T14:00:00.000Z",
      endsAt: "2026-08-01T20:00:00.000Z",
      timezone: "Europe/Ljubljana",
      commentsEnabled: true,
      aiBestPhotos: false,
      faceCollections: false,
      videoUnlimited: false,
      termsAccepted: true,
    });

    const rateLimitQuery = state.queries.find((query) => query.includes("COUNT(*)"));
    expect(rateLimitQuery).toContain("stripe_checkout_session_id IS NOT NULL");
  });

  it("creates a public order without account credentials or a user binding", async () => {
    await createCheckoutOrder({
      organizationName: "Studio Sever",
      ownerName: "Mitja Test",
      ownerEmail: "mitja@example.com",
      eventName: "Testni dogodek",
      eventLocation: "Ljubljana",
      startsAt: "2026-08-01T14:00:00.000Z",
      endsAt: "2026-08-01T20:00:00.000Z",
      timezone: "Europe/Ljubljana",
      commentsEnabled: true,
      aiBestPhotos: false,
      faceCollections: false,
      videoUnlimited: false,
      termsAccepted: true,
    });

    const insert = state.bindings.find(({ sql }) => sql.includes("INSERT INTO checkout_orders"));
    expect(insert?.values.slice(0, 6)).toEqual([
      expect.any(String), null, null, "Mitja Test", "mitja@example.com", null,
    ]);
    expect(insert?.values[6]).toBe("Studio Sever");
  });

  it("persists English locale and keeps Stripe return URLs on the English domain", async () => {
    await createCheckoutOrder({
      organizationName: "North Studio",
      ownerName: "Nina Novak",
      ownerEmail: "nina@example.com",
      eventName: "Launch party",
      eventLocation: "London",
      startsAt: "2026-08-01T14:00:00.000Z",
      endsAt: "2026-08-01T20:00:00.000Z",
      timezone: "Europe/Ljubljana",
      commentsEnabled: true,
      aiBestPhotos: false,
      faceCollections: false,
      videoUnlimited: false,
      termsAccepted: true,
    }, "en");

    const insert = state.bindings.find(({ sql }) => sql.includes("INSERT INTO checkout_orders"));
    expect(insert?.values).toContain("en");
    expect(state.createStripeCheckout).toHaveBeenCalledWith(expect.objectContaining({
      locale: "en",
      successUrl: "https://gallery-en.example.test/nakup/uspesen?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://gallery-en.example.test/naroci?preklicano=1",
    }));
  });
});
