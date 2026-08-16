import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ create: vi.fn(), attribution: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({
  PUBLIC_APP_URL_EN: "https://guestmosaic.com",
  VIDEO_UPLOAD_ENABLED: "true",
}) }));
vi.mock("@/lib/repositories/checkout", () => ({ createCheckoutOrder: state.create }));
vi.mock("@/lib/analytics/meta-attribution", () => ({ marketingAttributionFromRequest: state.attribution }));

import { POST } from "./route";

const body = {
  ownerName: "Nina Novak",
  ownerEmail: "nina@example.com",
  eventName: "Launch party",
  eventLocation: "London",
  startsAt: "2026-09-01T14:00:00.000Z",
  endsAt: "2026-09-01T20:00:00.000Z",
  timezone: "Europe/Ljubljana",
  commentsEnabled: true,
  aiBestPhotos: false,
  faceCollections: false,
  videoUnlimited: false,
  termsAccepted: true,
};

describe("checkout route marketing boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.create.mockResolvedValue({ id: "order-1", url: "https://checkout.stripe.test/1" });
    state.attribution.mockReturnValue({ consent: true, consentVersion: "2026-08-13" });
  });

  it("derives attribution from the request instead of accepting it from JSON", async () => {
    const request = new Request("https://guestmosaic.com/api/v1/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, marketingConsent: true, fbp: "forged" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(state.attribution).toHaveBeenCalledWith(request, "en");
    expect(state.create).toHaveBeenCalledWith(expect.not.objectContaining({
      marketingConsent: expect.anything(),
    }), "en", { consent: true, consentVersion: "2026-08-13" });
  });
});
