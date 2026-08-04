import { beforeEach, describe, expect, it, vi } from "vitest";
import { CURRENT_UPLOAD_CONSENT_VERSION } from "@/lib/domain/legal";

const state = vi.hoisted(() => ({
  findSession: vi.fn(), count: vi.fn(), create: vi.fn(), recordConsents: vi.fn(), reject: vi.fn(), sign: vi.fn(),
}));

vi.mock("@/lib/repositories/uploads", () => ({ findValidUploadSession: state.findSession }));
vi.mock("@/lib/repositories/voice-messages", () => ({
  countSessionVoiceMessages: state.count,
  createPendingVoiceMessage: state.create,
  recordVoiceMessageConsents: state.recordConsents,
  rejectVoiceMessage: state.reject,
}));
vi.mock("@/lib/security/tokens", () => ({ hashToken: vi.fn(async () => "hashed") }));
vi.mock("@/lib/storage/r2", () => ({ createPresignedUploadUrl: state.sign, PRESIGNED_UPLOAD_TTL_SECONDS: 600 }));

import { POST } from "./route";

function prepare() {
  return POST(new Request("https://example.test/voice", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mime: "audio/webm", sizeBytes: 12_000, durationMs: 8_000,
      publicationConsent: true, termsAccepted: true, consentVersion: CURRENT_UPLOAD_CONSENT_VERSION,
    }),
  }), { params: Promise.resolve({ token: "token" }) });
}

describe("voice message upload preparation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findSession.mockResolvedValue({ id: "session-1", event_id: "event-1", guest_id: "guest-1", ends_at: new Date(Date.now() + 60_000).toISOString() });
    state.count.mockResolvedValue(0);
    state.create.mockResolvedValue({ id: "voice-1", object_key: "voice-messages/event-1/voice-1/original", declared_mime: "audio/webm" });
    state.sign.mockResolvedValue("https://uploads.example.test/signed");
  });

  it("creates a scoped direct upload and records both consent purposes", async () => {
    const response = await prepare();
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ messageId: "voice-1", uploadUrl: "https://uploads.example.test/signed" });
    expect(state.create).toHaveBeenCalledWith(expect.objectContaining({ eventId: "event-1", guestId: "guest-1", durationMs: 8_000 }));
    expect(state.recordConsents).toHaveBeenCalledWith(expect.objectContaining({ voiceMessageId: "voice-1", publicationConsent: true }));
  });

  it("rejects recordings longer than two minutes", async () => {
    const response = await POST(new Request("https://example.test/voice", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ mime: "audio/webm", sizeBytes: 12_000, durationMs: 120_001, publicationConsent: true, termsAccepted: true, consentVersion: CURRENT_UPLOAD_CONSENT_VERSION }),
    }), { params: Promise.resolve({ token: "token" }) });
    expect(response.status).toBe(422);
    expect(state.create).not.toHaveBeenCalled();
  });
});
