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
  head: vi.fn(),
  deleteObject: vi.fn(),
  rejectMedia: vi.fn(),
  queueSend: vi.fn(),
  createMediaProcessingJob: vi.fn(),
  markMediaProcessingEnqueued: vi.fn(),
  markMediaProcessingEnqueueFailed: vi.fn(),
}));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    MEDIA: { head: state.head, delete: state.deleteObject },
    DB: {},
    MEDIA_PROCESSING_QUEUE: { send: state.queueSend },
  }),
}));

vi.mock("@/lib/repositories/uploads", () => ({
  findValidUploadSession: vi.fn(async () => ({ id: "session-1", organization_id: "eventaj" })),
  findMediaById: vi.fn(async () => state.media),
  rejectMedia: state.rejectMedia,
}));

vi.mock("@/lib/repositories/media-processing", () => ({
  createMediaProcessingJob: state.createMediaProcessingJob,
  markMediaProcessingEnqueued: state.markMediaProcessingEnqueued,
  markMediaProcessingEnqueueFailed: state.markMediaProcessingEnqueueFailed,
}));

vi.mock("@/lib/security/tokens", () => ({
  hashToken: vi.fn(async () => "hashed-token"),
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
    state.createMediaProcessingJob.mockResolvedValue({ id: "processing-job-1" });
    state.queueSend.mockResolvedValue(undefined);
  });

  it("accepts matching R2 metadata and queues image processing", async () => {
    const response = await completeRequest();

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ fileId: state.media.id, status: "processing" });
    expect(state.head).toHaveBeenCalledWith(state.media.object_key);
    expect(state.createMediaProcessingJob).toHaveBeenCalledWith({}, {
      mediaId: state.media.id,
      organizationId: "eventaj",
    });
    expect(state.queueSend).toHaveBeenCalledWith({
      jobId: "processing-job-1",
      mediaId: state.media.id,
      organizationId: "eventaj",
    });
    expect(state.markMediaProcessingEnqueued).toHaveBeenCalledWith({}, "processing-job-1", "eventaj");
    expect(state.rejectMedia).not.toHaveBeenCalled();
  });

  it("leaves an observable queued job for scheduled recovery when enqueueing fails", async () => {
    state.queueSend.mockRejectedValue(new Error("queue unavailable"));

    const response = await completeRequest();

    expect(response.status).toBe(202);
    expect(state.markMediaProcessingEnqueueFailed).toHaveBeenCalledWith({}, "processing-job-1", "eventaj");
  });

  it("deletes and rejects an object whose signed content type does not match", async () => {
    state.object = { size: 4, httpMetadata: { contentType: "image/png" } };

    const response = await completeRequest();

    expect(response.status).toBe(422);
    expect(state.deleteObject).toHaveBeenCalledWith(state.media.object_key);
    expect(state.rejectMedia).toHaveBeenCalledWith(state.media.id);
    expect(state.createMediaProcessingJob).not.toHaveBeenCalled();
    expect(state.queueSend).not.toHaveBeenCalled();
  });
});
