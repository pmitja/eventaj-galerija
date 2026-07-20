import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    STRIPE_SECRET_KEY: "sk_test_secret",
    STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
  }),
}));

import { verifyStripeWebhook } from "./stripe";

async function signature(body: string, timestamp: number) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode("whsec_test_secret"),
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
    await expect(verifyStripeWebhook(body, await signature(body, timestamp))).resolves.toMatchObject({ id: "evt_1" });
  });

  it("rejects a modified body", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signed = JSON.stringify({ id: "evt_1" });
    await expect(verifyStripeWebhook(JSON.stringify({ id: "evt_2" }), await signature(signed, timestamp)))
      .rejects.toThrow("INVALID_STRIPE_SIGNATURE");
  });
});
