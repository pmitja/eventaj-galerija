import { beforeEach, describe, expect, it, vi } from "vitest";

const analysis = vi.hoisted(() => ({ process: vi.fn() }));
vi.mock("../lib/storage/technical-analysis", () => ({ processTechnicalAnalysis: analysis.process }));

import worker, { chunkItems } from "./quality";

function message(body: unknown, attempts = 1) {
  return { id: "message-1", body, attempts, ack: vi.fn(), retry: vi.fn() };
}

function environment(itemStatus: "queued" | "completed" | "failed" = "queued") {
  const runs: Array<{ sql: string; bindings: unknown[] }> = [];
  const DB = {
    prepare: vi.fn((sql: string) => ({
      bind: vi.fn((...bindings: unknown[]) => ({
        first: vi.fn(async () => {
          if (sql.includes("SELECT qbi.status")) return { status: itemStatus };
          if (sql.includes("SELECT COUNT(*) AS total")) {
            return {
              total: 1,
              queued: runs.some(({ bindings }) => bindings[0] === "queued") ? 1 : 0,
              failed: runs.some(({ bindings }) => bindings[0] === "failed") ? 1 : 0,
            };
          }
          return null;
        }),
        run: vi.fn(async () => {
          runs.push({ sql, bindings });
          return { meta: { changes: 1 } };
        }),
      })),
    })),
  };
  return { DB, MEDIA: {}, IMAGES: {}, QUALITY_QUEUE: {}, runs };
}

describe("quality backfill worker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fans out large events in Queue batches of at most 100 photographs", () => {
    const batches = chunkItems(Array.from({ length: 205 }, (_, index) => index), 100);
    expect(batches.map((batch) => batch.length)).toEqual([100, 100, 5]);
  });

  it("acknowledges invalid messages without touching storage", async () => {
    const item = message({ type: "unknown" });
    const env = environment();
    await worker.queue!({ messages: [item] } as never, env as never);
    expect(item.ack).toHaveBeenCalledOnce();
    expect(env.DB.prepare).not.toHaveBeenCalled();
  });

  it("does not reprocess an item already completed by an earlier delivery", async () => {
    const item = message({ type: "media", backfillId: crypto.randomUUID(), mediaId: crypto.randomUUID(), organizationId: "eventaj" });
    const env = environment("completed");
    await worker.queue!({ messages: [item] } as never, env as never);
    expect(analysis.process).not.toHaveBeenCalled();
    expect(item.ack).toHaveBeenCalledOnce();
  });

  it("keeps a transient failure queued and retries with backoff", async () => {
    analysis.process.mockResolvedValue("failed");
    const item = message({ type: "media", backfillId: crypto.randomUUID(), mediaId: crypto.randomUUID(), organizationId: "eventaj" }, 1);
    const env = environment();
    await worker.queue!({ messages: [item] } as never, env as never);
    expect(item.retry).toHaveBeenCalledWith({ delaySeconds: 30 });
    expect(item.ack).not.toHaveBeenCalled();
    expect(env.runs.some(({ bindings }) => bindings[0] === "queued")).toBe(true);
  });

  it("marks the item failed and acknowledges after the final attempt", async () => {
    analysis.process.mockResolvedValue("failed");
    const item = message({ type: "media", backfillId: crypto.randomUUID(), mediaId: crypto.randomUUID(), organizationId: "eventaj" }, 3);
    const env = environment();
    await worker.queue!({ messages: [item] } as never, env as never);
    expect(item.ack).toHaveBeenCalledOnce();
    expect(item.retry).not.toHaveBeenCalled();
    expect(env.runs.some(({ bindings }) => bindings[0] === "failed")).toBe(true);
  });
});
