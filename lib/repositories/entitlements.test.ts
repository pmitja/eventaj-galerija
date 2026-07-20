import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ first: vi.fn(), bind: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({ DB: { prepare: () => ({ bind: (...values: unknown[]) => { state.bind(...values); return { first: state.first }; } }) } }),
}));

import { hasAiBestPhotosEntitlement } from "./entitlements";

describe("AI Best Photos entitlement", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is enabled only by an organization-scoped paid snapshot", async () => {
    state.first.mockResolvedValue({ value_json: '{"enabled":true,"photoLimit":3000}' });
    await expect(hasAiBestPhotosEntitlement("event-1", "org-1")).resolves.toBe(true);
    expect(state.bind).toHaveBeenCalledWith("event-1", "org-1");
  });

  it("fails closed for a missing or false snapshot", async () => {
    state.first.mockResolvedValue({ value_json: "false" });
    await expect(hasAiBestPhotosEntitlement("event-1", "org-1")).resolves.toBe(false);
  });
});
