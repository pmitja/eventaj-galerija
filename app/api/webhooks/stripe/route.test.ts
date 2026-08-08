import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ verify: vi.fn(), fulfill: vi.fn(), expire: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ PUBLIC_APP_URL_EN: "https://guestmosaic.com" }) }));
vi.mock("@/lib/billing/stripe", () => ({ verifyStripeWebhook: state.verify }));
vi.mock("@/lib/repositories/checkout", () => ({ fulfillCheckout: state.fulfill, expireCheckout: state.expire }));

import { POST } from "./route";

describe("Stripe webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.verify.mockResolvedValue({ type: "checkout.session.completed", data: { object: { id: "cs_test_paid" } } });
    state.fulfill.mockResolvedValue({ status: "provisioned" });
  });

  it("provisions a paid checkout once signature verification succeeds", async () => {
    const response = await POST(new Request("https://example.test/api/webhooks/stripe", {
      method: "POST", headers: { "stripe-signature": "t=1,v1=signed" }, body: "raw-body",
    }));
    expect(response.status).toBe(204);
    expect(state.verify).toHaveBeenCalledWith("raw-body", "t=1,v1=signed", "sl");
    expect(state.fulfill).toHaveBeenCalledWith("cs_test_paid", "sl");
  });

  it("uses the Guest Mosaic account for the international webhook hostname", async () => {
    const response = await POST(new Request("https://guestmosaic.com/api/webhooks/stripe", {
      method: "POST", headers: { "stripe-signature": "t=1,v1=guest" }, body: "raw-body",
    }));
    expect(response.status).toBe(204);
    expect(state.verify).toHaveBeenCalledWith("raw-body", "t=1,v1=guest", "en");
    expect(state.fulfill).toHaveBeenCalledWith("cs_test_paid", "en");
  });

  it("rejects unsigned requests before provisioning", async () => {
    const response = await POST(new Request("https://example.test/api/webhooks/stripe", { method: "POST", body: "{}" }));
    expect(response.status).toBe(400);
    expect(state.fulfill).not.toHaveBeenCalled();
  });
});
