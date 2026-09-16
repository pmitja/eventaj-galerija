import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    STRIPE_SECRET_KEY: "sk_test_secret",
    STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
    STRIPE_GUESTMOSAIC_SECRET_KEY: "sk_test_guest_secret",
    STRIPE_GUESTMOSAIC_WEBHOOK_SECRET: "whsec_test_guest_secret",
  }),
}));

import { createStripeCheckout, verifyStripeWebhook } from "./stripe";

async function signature(body: string, timestamp: number, secret = "whsec_test_secret") {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`));
  const digest = [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `t=${timestamp},v1=${digest}`;
}

describe("Stripe webhook verification", () => {
  it("accepts an unmodified, currently signed body", async () => {
    const body = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: { id: "cs_test_1" } } });
    const timestamp = Math.floor(Date.now() / 1000);
    await expect(verifyStripeWebhook(body, await signature(body, timestamp), "sl")).resolves.toMatchObject({ id: "evt_1" });
  });

  it("rejects a modified body", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signed = JSON.stringify({ id: "evt_1" });
    await expect(verifyStripeWebhook(JSON.stringify({ id: "evt_2" }), await signature(signed, timestamp), "sl"))
      .rejects.toThrow("INVALID_STRIPE_SIGNATURE");
  });

  it("uses the Guest Mosaic signing secret for international checkouts", async () => {
    const body = JSON.stringify({ id: "evt_guest", type: "checkout.session.completed", data: { object: { id: "cs_test_guest" } } });
    const timestamp = Math.floor(Date.now() / 1000);
    const header = await signature(body, timestamp, "whsec_test_guest_secret");
    await expect(verifyStripeWebhook(body, header, "en")).resolves.toMatchObject({ id: "evt_guest" });
    await expect(verifyStripeWebhook(body, header, "sl")).rejects.toThrow("INVALID_STRIPE_SIGNATURE");
  });
});

describe("regional Checkout currencies", () => {
  it.each([["en", "gbp"], ["en-us", "usd"], ["sl", "eur"]] as const)("charges all %s line items in %s", async (locale, currency) => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
      url: "https://checkout.stripe.test/session", amount_total: 7000, currency,
    }));
    try {
      await createStripeCheckout({ orderId: "regional", email: "test@example.com", amountCents: 7000,
        aiBestPhotos: true, faceCollections: true, videoUnlimited: true, locale,
        successUrl: "https://guestmosaic.com/order/success", cancelUrl: "https://guestmosaic.com/order" });
      const body = fetchMock.mock.calls[0][1]?.body as URLSearchParams;
      for (let index = 0; index < 4; index++) expect(body.get(`line_items[${index}][price_data][currency]`)).toBe(currency);
    } finally { fetchMock.mockRestore(); }
  });
});
