import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ token: "meta-secret-token" }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ META_CONVERSIONS_API_TOKEN: state.token }) }));

import { sendMetaConversion } from "./meta-conversions";

describe("Meta Conversions API adapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    state.token = "meta-secret-token";
  });

  it("hashes email and sends an exact, deduplicatable Purchase value", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      events_received: 1,
      messages: [],
      fbtrace_id: "trace-1",
    }), { status: 200, headers: { "content-type": "application/json" } }));

    await expect(sendMetaConversion({
      name: "Purchase",
      eventId: "checkout.purchase:order-1",
      occurredAt: new Date("2026-08-13T12:00:00.000Z"),
      sourceUrl: "https://guestmosaic.com/order/success",
      email: " Buyer@Example.com ",
      amountCents: 5_500,
      currency: "eur",
      orderId: "order-1",
      fbp: "fb.1.1786630000.browser_1",
      clientIp: "203.0.113.10",
      clientUserAgent: "Test browser",
    })).resolves.toBe("sent");

    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(String(endpoint)).toContain("graph.facebook.com/v25.0/1024314580235586/events");
    expect(String(endpoint)).toContain("access_token=meta-secret-token");
    const payload = JSON.parse(String(init?.body));
    expect(payload.data[0]).toMatchObject({
      event_name: "Purchase",
      event_time: 1786622400,
      event_id: "checkout.purchase:order-1",
      action_source: "website",
      custom_data: { currency: "EUR", value: 55, order_id: "order-1" },
    });
    expect(payload.data[0].user_data.em[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(payload)).not.toContain("Buyer@Example.com");
  });

  it("is disabled without a configured secret and performs no request", async () => {
    state.token = "";
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await expect(sendMetaConversion({
      name: "InitiateCheckout",
      eventId: "checkout.initiate:order-1",
      occurredAt: new Date(),
      sourceUrl: "https://guestmosaic.com/order",
      email: "buyer@example.com",
      amountCents: 3_500,
      currency: "EUR",
      orderId: "order-1",
    })).resolves.toBe("disabled");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
