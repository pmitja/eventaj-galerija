import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findSession: vi.fn(),
  prepare: vi.fn(),
  markEnqueued: vi.fn(),
  hashToken: vi.fn(),
  head: vi.fn(),
  deleteObject: vi.fn(),
  send: vi.fn(),
  sendBatch: vi.fn(),
}));
vi.mock("@/lib/repositories/face-search", () => ({
  findFaceSearchSessionByTokenHash: state.findSession,
  prepareFaceSearch: state.prepare,
  markFaceJobsEnqueued: state.markEnqueued,
}));
vi.mock("@/lib/security/tokens", () => ({ hashToken: state.hashToken }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({
  MEDIA: { head: state.head, delete: state.deleteObject },
  FACE_PROCESSING_QUEUE: { send: state.send, sendBatch: state.sendBatch },
}) }));

import { POST } from "./route";

const session = {
  id: "6f414b0a-7b55-4597-a5e9-cd12f21d2f5a",
  event_id: "event-1",
  organization_id: "org-1",
  selfie_object_key: "temporary/face-search/selfie",
  declared_mime: "image/jpeg",
  size_bytes: 1234,
  status: "awaiting_upload",
  expires_at: "2099-01-01T00:00:00.000Z",
};

function complete() {
  return POST(new Request("https://example.test/api/v1/face-search-sessions/token/complete", { method: "POST" }), {
    params: Promise.resolve({ token: "token" }),
  });
}

describe("face search upload completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.hashToken.mockResolvedValue("hash");
    state.findSession.mockResolvedValue(session);
    state.head.mockResolvedValue({ size: 1234, httpMetadata: { contentType: "image/jpeg" } });
    state.prepare.mockResolvedValue([{ id: "3d8e1d12-dfb2-487d-92b8-9b117c8f71ec", media_file_id: "33fbd5a1-f8f8-4a34-9d6b-fde0e79929a3" }]);
    state.send.mockResolvedValue(undefined);
    state.sendBatch.mockResolvedValue(undefined);
  });

  it("deletes a mismatched direct upload and never queues biometric work", async () => {
    state.head.mockResolvedValue({ size: 999, httpMetadata: { contentType: "image/jpeg" } });
    const response = await complete();
    expect(response.status).toBe(422);
    expect(state.deleteObject).toHaveBeenCalledWith(session.selfie_object_key);
    expect(state.send).not.toHaveBeenCalled();
  });

  it("queues event-scoped index jobs before the delayed selfie search", async () => {
    const response = await complete();
    expect(response.status).toBe(202);
    expect(state.sendBatch).toHaveBeenCalledWith([{ body: expect.objectContaining({ kind: "index", organizationId: "org-1" }) }]);
    expect(state.send).toHaveBeenCalledWith({ kind: "search", sessionId: session.id, organizationId: "org-1" }, { delaySeconds: 5 });
  });
});
