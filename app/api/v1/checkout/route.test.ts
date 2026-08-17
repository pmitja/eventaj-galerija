import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ create: vi.fn(), attribution: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({
  PUBLIC_APP_URL_EN: "https://guestmosaic.com",
  VIDEO_UPLOAD_ENABLED: "true",
  FACE_SEARCH_ENABLED: "false",
  FACE_SEARCH_POLICY_VERSION: "",
}) }));
vi.mock("@/lib/repositories/checkout", () => ({ createCheckoutOrder: state.create }));
vi.mock("@/lib/analytics/meta-attribution", () => ({ marketingAttributionFromRequest: state.attribution }));

import { POST } from "./route";

const body = {
  ownerEmail: "nina@example.com",
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

  it("does not allow clients to add paid options to the fixed-price minimal checkout", async () => {
    const response = await POST(new Request("https://guestmosaic.com/api/v1/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, faceCollections: true }),
    }));

    expect(response.status).toBe(201);
    expect(state.create).toHaveBeenCalledWith(
      { ownerEmail: "nina@example.com", termsAccepted: true },
      "en",
      expect.anything(),
    );
  });
});
