import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ sql: "", first: vi.fn(), run: vi.fn(), batch: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: {
      prepare: (sql: string) => {
        state.sql = sql;
        return {
          bind: (...values: unknown[]) => ({
            sql,
            values,
            first: () => state.first(sql, values),
            run: () => state.run(sql, values),
          }),
        };
      },
      batch: state.batch,
    },
  }),
}));

import { findPublicEvent, insertEvent } from "./events";

describe("public event lookup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps ended events publicly visible while the gallery is enabled", async () => {
    state.first.mockResolvedValue(null);
    await findPublicEvent("poroka");
    expect(state.sql).toContain("status IN ('active', 'ended')");
    expect(state.sql).toContain("gallery_enabled = 1");
  });
});

describe("dashboard event creation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("includes the base video allowance", async () => {
    state.first
      .mockResolvedValueOnce({ id: "customer-1" })
      .mockResolvedValueOnce({ id: "package-1", code: "advanced" })
      .mockResolvedValueOnce({ id: "event-1" });

    await insertEvent({
      name: "Poroka",
      location: "Bled",
      startsAt: "2026-08-15T12:00:00.000Z",
      endsAt: "2026-08-16T02:00:00.000Z",
      timezone: "Europe/Ljubljana",
      customerName: "Ana Novak",
      customerEmail: "ana@example.com",
      packageCode: "advanced",
      commentsEnabled: true,
    }, "organization-1");

    const statements = state.batch.mock.calls[0]?.[0] as Array<{ sql: string; values: unknown[] }>;
    const videoEntitlement = statements.find((statement) => statement.sql.includes("'video_uploads'"));
    expect(videoEntitlement).toBeDefined();
    expect(JSON.parse(String(videoEntitlement?.values[2]))).toMatchObject({
      includedCount: 20,
      unlimited: false,
      maxDurationSeconds: 60,
      maxBytes: 524_288_000,
      fairUseCount: 1_000,
    });
  });
});
