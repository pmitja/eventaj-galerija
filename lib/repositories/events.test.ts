import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ sql: "", first: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: {
      prepare: (sql: string) => {
        state.sql = sql;
        return { bind: () => ({ first: state.first }) };
      },
    },
  }),
}));

import { findPublicEvent } from "./events";

describe("public event lookup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps ended events publicly visible while the gallery is enabled", async () => {
    state.first.mockResolvedValue(null);
    await findPublicEvent("poroka");
    expect(state.sql).toContain("status IN ('active', 'ended')");
    expect(state.sql).toContain("gallery_enabled = 1");
  });
});
