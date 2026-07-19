import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({ processImage: vi.fn() }));
vi.mock("../lib/storage/r2", () => ({ processImage: storage.processImage }));

import worker from "./media-processing";

const ids = {
  jobId: "4ff3d2e1-63fb-4d88-a07e-148f06690e44",
  mediaId: "20e904d5-7f5b-4288-b0fc-43c5dceee4b4",
};

function queueMessage(attempts = 1) {
  return {
    id: "message-1",
    attempts,
    body: { jobId: ids.jobId, mediaId: ids.mediaId, organizationId: "eventaj" },
    ack: vi.fn(),
    retry: vi.fn(),
  };
}

function environment(status: "queued" | "processing" | "completed" | "failed" = "queued", attemptCount = 0) {
  const runs: Array<{ sql: string; bindings: unknown[] }> = [];
  const DB = {
    prepare: vi.fn((sql: string) => ({
      bind: vi.fn((...bindings: unknown[]) => ({
        first: vi.fn(async () => sql.includes("SELECT j.id") ? {
          id: ids.jobId,
          media_file_id: ids.mediaId,
          organization_id: "eventaj",
          status,
          attempt_count: attemptCount,
        } : null),
        run: vi.fn(async () => {
          runs.push({ sql, bindings });
          return { meta: { changes: 1 } };
        }),
      })),
    })),
  };
  return { DB, MEDIA: {}, IMAGES: {}, MEDIA_PROCESSING_QUEUE: {}, runs };
}

describe("media processing worker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("processes one claimed job and acknowledges it", async () => {
    storage.processImage.mockResolvedValue("ready");
    const message = queueMessage();
    const env = environment();

    await worker.queue!({ messages: [message] } as never, env as never);

    expect(storage.processImage).toHaveBeenCalledWith(ids.mediaId, "eventaj", env);
    expect(message.ack).toHaveBeenCalledOnce();
    expect(env.runs.some(({ bindings }) => bindings[0] === "completed")).toBe(false);
    expect(env.runs.some(({ sql }) => sql.includes("status = 'completed'"))).toBe(true);
  });

  it("retries a transient failure with backoff", async () => {
    storage.processImage.mockRejectedValue(new Error("TRANSFORM_FAILED"));
    const message = queueMessage();
    const env = environment();

    await worker.queue!({ messages: [message] } as never, env as never);

    expect(message.retry).toHaveBeenCalledWith({ delaySeconds: 15 });
    expect(message.ack).not.toHaveBeenCalled();
    expect(env.runs.some(({ sql }) => sql.includes("status = 'queued'"))).toBe(true);
  });

  it("does not redo a job completed by an earlier delivery", async () => {
    const message = queueMessage(2);
    const env = environment("completed", 1);

    await worker.queue!({ messages: [message] } as never, env as never);

    expect(storage.processImage).not.toHaveBeenCalled();
    expect(message.ack).toHaveBeenCalledOnce();
  });
});
