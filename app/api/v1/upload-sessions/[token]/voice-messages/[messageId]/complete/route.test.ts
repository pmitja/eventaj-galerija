import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findSession: vi.fn(), findMessage: vi.fn(), ready: vi.fn(), reject: vi.fn(), head: vi.fn(), get: vi.fn(), deleteObject: vi.fn(),
}));

vi.mock("@/lib/repositories/uploads", () => ({ findValidUploadSession: state.findSession }));
vi.mock("@/lib/repositories/voice-messages", () => ({
  findVoiceMessageById: state.findMessage,
  markVoiceMessageReady: state.ready,
  rejectVoiceMessage: state.reject,
}));
vi.mock("@/lib/security/tokens", () => ({ hashToken: vi.fn(async () => "hashed") }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ MEDIA: { head: state.head, get: state.get, delete: state.deleteObject } }) }));

import { POST } from "./route";

describe("voice message upload completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findSession.mockResolvedValue({ id: "session-1" });
    state.findMessage.mockResolvedValue({ id: "voice-1", upload_session_id: "session-1", object_key: "voice/object", size_bytes: 4, declared_mime: "audio/webm", status: "pending" });
    state.head.mockResolvedValue({ size: 4, httpMetadata: { contentType: "audio/webm" } });
    state.get.mockResolvedValue({ body: true, arrayBuffer: async () => new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]).buffer });
  });

  it("publishes an object only after metadata and magic-byte validation", async () => {
    const response = await POST(new Request("https://example.test/complete", { method: "POST" }), { params: Promise.resolve({ token: "token", messageId: "voice-1" }) });
    expect(response.status).toBe(200);
    expect(state.get).toHaveBeenCalledWith("voice/object", { range: { offset: 0, length: 16 } });
    expect(state.ready).toHaveBeenCalledWith("voice-1");
  });

  it("physically deletes a spoofed audio object", async () => {
    state.get.mockResolvedValue({ body: true, arrayBuffer: async () => new TextEncoder().encode("fake").buffer });
    const response = await POST(new Request("https://example.test/complete", { method: "POST" }), { params: Promise.resolve({ token: "token", messageId: "voice-1" }) });
    expect(response.status).toBe(422);
    expect(state.deleteObject).toHaveBeenCalledWith("voice/object");
    expect(state.reject).toHaveBeenCalledWith("voice-1");
    expect(state.ready).not.toHaveBeenCalled();
  });
});
