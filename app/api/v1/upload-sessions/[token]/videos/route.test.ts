import { beforeEach, describe, expect, it, vi } from "vitest";
import { CURRENT_UPLOAD_CONSENT_VERSION } from "@/lib/domain/legal";

const state = vi.hoisted(() => ({
  findSession: vi.fn(),
  getPolicy: vi.fn(),
  reserve: vi.fn(),
  attach: vi.fn(),
  recordConsents: vi.fn(),
  reject: vi.fn(),
  createTus: vi.fn(),
  deleteVideo: vi.fn(),
}));

vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ VIDEO_UPLOAD_ENABLED: "true" }) }));
vi.mock("@/lib/domain/events", () => ({ areUploadsOpen: () => true }));
vi.mock("@/lib/security/tokens", () => ({ hashToken: async () => "token-hash" }));
vi.mock("@/lib/repositories/uploads", () => ({
  findValidUploadSession: state.findSession,
  getVideoUploadPolicy: state.getPolicy,
  reservePendingVideo: state.reserve,
  attachStreamUid: state.attach,
  recordUploadConsents: state.recordConsents,
  rejectMedia: state.reject,
}));
vi.mock("@/lib/storage/stream", () => ({
  createTusVideoUpload: state.createTus,
  deleteStreamVideo: state.deleteVideo,
}));

import { POST } from "./route";

const payload = {
  filename: "utrinek.mp4",
  mime: "video/mp4",
  sizeBytes: 25_000_000,
  publicationConsent: true,
  termsAccepted: true,
  consentVersion: CURRENT_UPLOAD_CONSENT_VERSION,
};

function requestVideo() {
  return POST(new Request("https://example.test/api/v1/upload-sessions/token/videos", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
  }), { params: Promise.resolve({ token: "token" }) });
}

describe("video upload preparation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findSession.mockResolvedValue({
      id: "session-1", event_id: "event-1", guest_id: "guest-1",
      ends_at: "2026-08-01T12:00:00.000Z", expires_at: "2099-08-01T12:00:00.000Z",
    });
    state.getPolicy.mockResolvedValue({
      includedCount: 20, unlimited: false, maxDurationSeconds: 60,
      maxBytes: 524_288_000, fairUseCount: 1000,
    });
    state.reserve.mockResolvedValue({ id: "media-1" });
    state.createTus.mockResolvedValue({ uid: "stream-1", uploadUrl: "https://upload.example.test/1" });
  });

  it("reserves one of the 20 included slots and records versioned consent", async () => {
    const response = await requestVideo();

    expect(response.status).toBe(201);
    expect(state.reserve).toHaveBeenCalledWith(expect.objectContaining({ eventId: "event-1", limit: 20 }));
    expect(state.createTus).toHaveBeenCalledWith(expect.objectContaining({ maxDurationSeconds: 60 }));
    expect(state.attach).toHaveBeenCalledWith("media-1", "stream-1");
    expect(state.recordConsents).toHaveBeenCalledWith(expect.objectContaining({
      mediaId: "media-1", policyVersion: CURRENT_UPLOAD_CONSENT_VERSION, publicationConsent: true,
    }));
  });

  it("fails closed when the event quota is exhausted", async () => {
    state.reserve.mockResolvedValue(null);
    const response = await requestVideo();

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      code: "VIDEO_EVENT_LIMIT",
      title: "Dogodek je dosegel omejitev 20 videov",
    });
    expect(state.createTus).not.toHaveBeenCalled();
  });

  it("uses the 1,000-video fair-use limit for the unlimited add-on", async () => {
    state.getPolicy.mockResolvedValue({
      includedCount: 20, unlimited: true, maxDurationSeconds: 60,
      maxBytes: 524_288_000, fairUseCount: 1000,
    });
    state.reserve.mockResolvedValue(null);

    const response = await requestVideo();

    expect(state.reserve).toHaveBeenCalledWith(expect.objectContaining({ limit: 1000 }));
    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({ code: "VIDEO_FAIR_USE_LIMIT" });
  });
});
