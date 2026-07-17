import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  media: {
    id: "c02f21cb-9b40-42d0-9f30-3cdfd684af39",
    upload_session_id: "session-1",
    object_key: "originals/event-1/media-1/original",
    size_bytes: 4,
    declared_mime: "image/jpeg",
    status: "pending" as const,
  },
  object: {
    size: 4,
    httpMetadata: { contentType: "image/jpeg" },
  } as { size: number; httpMetadata: { contentType?: string } } | null,
  waitUntil: vi.fn(),
  head: vi.fn(),
  deleteObject: vi.fn(),
  markMediaProcessing: vi.fn(),
  rejectMedia: vi.fn(),
  processImage: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({ ctx: { waitUntil: state.waitUntil } }),
}));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    MEDIA: { head: state.head, delete: state.deleteObject },
  }),
}));

vi.mock("@/lib/repositories/uploads", () => ({
  findValidUploadSession: vi.fn(async () => ({ id: "session-1", organization_id: "eventaj" })),
  findMediaById: vi.fn(async () => state.media),
  markMediaProcessing: state.markMediaProcessing,
  rejectMedia: state.rejectMedia,
}));

vi.mock("@/lib/security/tokens", () => ({
  hashToken: vi.fn(async () => "hashed-token"),
}));

vi.mock("@/lib/storage/r2", () => ({
  processImage: state.processImage,
}));

import { POST } from "./route";

function completeRequest() {
  return POST(new Request("https://example.test/complete", { method: "POST" }), {
    params: Promise.resolve({ token: "upload-token", fileId: state.media.id }),
  });
}

describe("upload completion route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.object = { size: 4, httpMetadata: { contentType: "image/jpeg" } };
    state.head.mockImplementation(async () => state.object);
    state.markMediaProcessing.mockResolvedValue(true);
    state.processImage.mockResolvedValue(undefined);
  });

  it("accepts matching R2 metadata and schedules image processing", async () => {
    const response = await completeRequest();

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ fileId: state.media.id, status: "processing" });
    expect(state.head).toHaveBeenCalledWith(state.media.object_key);
    expect(state.markMediaProcessing).toHaveBeenCalledWith(state.media.id);
    expect(state.processImage).toHaveBeenCalledWith(state.media.id, "eventaj");
    expect(state.waitUntil).toHaveBeenCalledOnce();
    expect(state.rejectMedia).not.toHaveBeenCalled();
  });

  it("deletes and rejects an object whose signed content type does not match", async () => {
    state.object = { size: 4, httpMetadata: { contentType: "image/png" } };

    const response = await completeRequest();

    expect(response.status).toBe(422);
    expect(state.deleteObject).toHaveBeenCalledWith(state.media.object_key);
    expect(state.rejectMedia).toHaveBeenCalledWith(state.media.id);
    expect(state.markMediaProcessing).not.toHaveBeenCalled();
    expect(state.waitUntil).not.toHaveBeenCalled();
  });
});
