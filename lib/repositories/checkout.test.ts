import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  queries: [] as string[],
  bindings: [] as Array<{ sql: string; values: unknown[] }>,
  createStripeCheckout: vi.fn(),
  retrieveStripeCheckout: vi.fn(),
  first: vi.fn(),
  run: vi.fn(),
  batch: vi.fn(),
  send: vi.fn(),
  sendMeta: vi.fn(),
}));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    PUBLIC_APP_URL: "https://gallery.example.test",
    PUBLIC_APP_URL_EN: "https://gallery-en.example.test",
    ORGANIZATION_ID: "organization-1",
    EXPORT_QUEUE: { send: state.send },
    DB: {
      prepare: (sql: string) => {
        state.queries.push(sql);
        return {
          bind: (...values: unknown[]) => {
            state.bindings.push({ sql, values });
            return {
              sql,
              values,
              first: () => state.first(sql, values),
              run: () => state.run(sql, values),
            };
          },
        };
      },
      batch: state.batch,
    },
  }),
}));

vi.mock("@/lib/billing/stripe", () => ({
  createStripeCheckout: state.createStripeCheckout,
  retrieveStripeCheckout: state.retrieveStripeCheckout,
}));

vi.mock("@/lib/analytics/meta-conversions", () => ({ sendMetaConversion: state.sendMeta }));

import { createCheckoutOrder, fulfillCheckout } from "./checkout";

describe("checkout rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.queries.length = 0;
    state.bindings.length = 0;
    state.createStripeCheckout.mockResolvedValue({ id: "cs_test_1", url: "https://checkout.stripe.test/session" });
    state.first.mockImplementation((sql: string) => sql.includes("COUNT(*)") ? { count: 0 } : null);
    state.run.mockResolvedValue({ meta: { changes: 1 } });
    state.batch.mockResolvedValue([]);
    state.send.mockResolvedValue(undefined);
    state.sendMeta.mockResolvedValue("sent");
  });

  it("provisions 20 video slots for a purchase without the video add-on", async () => {
    const order = {
      id: "order-1",
      owner_name: "Mitja Test",
      owner_email: "mitja@example.com",
      organization_name: "Studio Sever",
      event_name: "Testni dogodek",
      event_location: "Ljubljana",
      starts_at: "2026-08-15T14:00:00.000Z",
      ends_at: "2026-08-15T20:00:00.000Z",
      timezone: "Europe/Ljubljana",
      comments_enabled: 1,
      ai_best_photos: 0,
      face_collections: 0,
      video_unlimited: 0,
      amount_cents: 3_500,
      currency: "EUR",
      locale: "en",
      status: "pending",
      marketing_consent: 1,
      marketing_consent_version: "2026-08-13",
      meta_fbp: "fb.1.1786630000.browser_1",
      meta_fbc: null,
      meta_client_ip: "203.0.113.10",
      meta_client_user_agent: "Test browser",
      meta_purchase_sent_at: null,
      completed_at: "2026-08-13T12:00:00.000Z",
      updated_at: "2026-08-13T12:00:00.000Z",
    };
    state.retrieveStripeCheckout.mockResolvedValue({
      payment_status: "paid",
      amount_total: 3_500,
      currency: "eur",
      payment_intent: "pi_1",
      customer: "cus_1",
      metadata: { orderId: order.id },
    });
    state.first.mockImplementation((sql: string) => {
      if (sql.includes("stripe_checkout_session_id")) return order;
      if (sql.includes("SELECT id FROM customers")) return null;
      if (sql.includes("SELECT * FROM checkout_orders")) return { ...order, status: "provisioned" };
      return null;
    });

    await fulfillCheckout("cs_test_paid");

    const statements = state.batch.mock.calls[0]?.[0] as Array<{ sql: string; values: unknown[] }>;
    const videoEntitlement = statements.find((statement) => statement.sql.includes("'video_uploads'"));
    expect(JSON.parse(String(videoEntitlement?.values[2]))).toMatchObject({
      includedCount: 20,
      unlimited: false,
    });
    expect(state.sendMeta).toHaveBeenCalledWith(expect.objectContaining({
      name: "Purchase",
      eventId: "checkout.purchase:order-1",
      amountCents: 3_500,
    }));
    expect(state.queries).toContainEqual(expect.stringContaining("meta_purchase_sent_at = COALESCE"));
  });

  it("counts only attempts that reached a Stripe Checkout session", async () => {
    await createCheckoutOrder({
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
    expect(insert?.values[6]).toBe("Mitja Test");
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
      successUrl: "https://gallery-en.example.test/order/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://gallery-en.example.test/order?preklicano=1",
    }));
  });

  it("stores consented attribution and sends InitiateCheckout after Stripe accepts the order", async () => {
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
    }, "en", {
      consent: true,
      consentVersion: "2026-08-13",
      fbp: "fb.1.1786630000.browser_1",
      fbc: null,
      clientIp: "203.0.113.10",
      clientUserAgent: "Test browser",
    });

    const insert = state.bindings.find(({ sql }) => sql.includes("INSERT INTO checkout_orders"));
    expect(insert?.values).toEqual(expect.arrayContaining([
      "2026-08-13", "fb.1.1786630000.browser_1", "203.0.113.10", "Test browser",
    ]));
    expect(state.sendMeta).toHaveBeenCalledWith(expect.objectContaining({
      name: "InitiateCheckout",
      eventId: expect.stringMatching(/^checkout\.initiate:/),
      amountCents: 3_500,
      currency: "EUR",
    }));
  });

  it("does not block Stripe Checkout when Meta is unavailable", async () => {
    state.sendMeta.mockRejectedValueOnce(new Error("META_UNAVAILABLE"));
    await expect(createCheckoutOrder({
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
    }, "en", {
      consent: true,
      consentVersion: "2026-08-13",
      fbp: null,
      fbc: null,
      clientIp: null,
      clientUserAgent: null,
    })).resolves.toEqual({ id: expect.any(String), url: "https://checkout.stripe.test/session" });
  });
});
