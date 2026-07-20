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

import { findActiveAccessPoint } from "./access-points";

describe("access point redirect lookup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("still resolves QR codes for ended events so old links keep working", async () => {
    state.first.mockResolvedValue(null);
    await findActiveAccessPoint("FbkHjDnVfiBjuTyOXqKExg");
    expect(state.sql).toContain("e.status IN ('active', 'ended')");
    expect(state.sql).toContain("ap.active = 1");
  });
});
