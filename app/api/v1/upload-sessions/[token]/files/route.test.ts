import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  signer: vi.fn(),
  insertPendingMedia: vi.fn(),
  findValidUploadSession: vi.fn(),
}));

vi.mock("@/lib/repositories/uploads", () => ({
  countSessionFiles: vi.fn(async () => 0),
  findValidUploadSession: state.findValidUploadSession,
  insertPendingMedia: state.insertPendingMedia,
}));

vi.mock("@/lib/security/tokens", () => ({
  hashToken: vi.fn(async () => "hashed-token"),
}));

vi.mock("@/lib/storage/r2", () => ({
  createPresignedUploadUrl: state.signer,
  PRESIGNED_UPLOAD_TTL_SECONDS: 600,
}));

import { POST } from "./route";

function prepareRequest() {
  return POST(new Request("https://example.test/files", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      filename: "photo.webp",
      mime: "image/webp",
      sizeBytes: 12_000,
      publicationConsent: true,
    }),
  }), { params: Promise.resolve({ token: "upload-token" }) });
}

describe("upload file preparation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.signer.mockResolvedValue("https://uploads.example.test/signed");
    state.insertPendingMedia.mockResolvedValue({ id: "media-1" });
    state.findValidUploadSession.mockResolvedValue({
      id: "session-1", event_id: "event-1",
      ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  });

  it("creates the pending media only after signing succeeds", async () => {
    const response = await prepareRequest();

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      fileId: "media-1",
      uploadUrl: "https://uploads.example.test/signed",
      expiresInSeconds: 600,
    });
    expect(state.signer.mock.invocationCallOrder[0]).toBeLessThan(
      state.insertPendingMedia.mock.invocationCallOrder[0],
    );
  });

  it("blocks new files more than 24 hours after the event ends", async () => {
    state.findValidUploadSession.mockResolvedValue({
      id: "session-1", event_id: "event-1",
      ends_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    });

    const response = await prepareRequest();

    expect(response.status).toBe(410);
    expect(await response.json()).toMatchObject({ code: "EVENT_ENDED" });
    expect(state.signer).not.toHaveBeenCalled();
    expect(state.insertPendingMedia).not.toHaveBeenCalled();
  });

  it("returns a recoverable problem without an orphan record when signing is unavailable", async () => {
    state.signer.mockRejectedValue(new Error("missing credentials"));

    const response = await prepareRequest();

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      code: "UPLOAD_STORAGE_UNAVAILABLE",
      title: "Shramba za nalaganje trenutno ni dosegljiva",
    });
    expect(state.insertPendingMedia).not.toHaveBeenCalled();
  });
});
