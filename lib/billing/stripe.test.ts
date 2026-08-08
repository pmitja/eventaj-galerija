import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    STRIPE_SECRET_KEY: "sk_test_secret",
    STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
    STRIPE_GUESTMOSAIC_SECRET_KEY: "sk_test_guest_secret",
    STRIPE_GUESTMOSAIC_WEBHOOK_SECRET: "whsec_test_guest_secret",
  }),
}));

import { verifyStripeWebhook } from "./stripe";

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
