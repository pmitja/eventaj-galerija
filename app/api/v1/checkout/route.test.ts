import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ create: vi.fn(), attribution: vi.fn(), videoEnabled: "true" }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({
  PUBLIC_APP_URL_EN: "https://guestmosaic.com",
  VIDEO_UPLOAD_ENABLED: state.videoEnabled,
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
    state.videoEnabled = "true";
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

  it("ignores paid options the order page does not sell", async () => {
    const response = await POST(new Request("https://guestmosaic.com/api/v1/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, faceCollections: true }),
    }));

    expect(response.status).toBe(201);
    expect(state.create).toHaveBeenCalledWith(
      { ownerEmail: "nina@example.com", termsAccepted: true, aiBestPhotos: false, videoUnlimited: false },
      "en",
      expect.anything(),
    );
  });

  it("passes the chosen add-ons through to the order", async () => {
    const response = await POST(new Request("https://guestmosaic.com/api/v1/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, aiBestPhotos: true, videoUnlimited: true }),
    }));

    expect(response.status).toBe(201);
    expect(state.create).toHaveBeenCalledWith(
      expect.objectContaining({ aiBestPhotos: true, videoUnlimited: true }),
      "en",
      expect.anything(),
    );
  });

  it("rejects the video add-on while video uploads are disabled", async () => {
    state.videoEnabled = "false";
    const response = await POST(new Request("https://guestmosaic.com/api/v1/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, videoUnlimited: true }),
    }));

    expect(response.status).toBe(422);
    expect(state.create).not.toHaveBeenCalled();
  });
  it("keeps the middleware US locale after the API rewrite", async () => {
    const response = await POST(new Request("https://guestmosaic.com/api/v1/checkout", {
      method: "POST", headers: { "content-type": "application/json", "x-locale": "en-us" }, body: JSON.stringify(body),
    }));
    expect(response.status).toBe(201);
    expect(state.create).toHaveBeenCalledWith(expect.objectContaining(body), "en-us", expect.anything());
  });

});
