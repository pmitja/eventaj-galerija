import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ sql: "", all: vi.fn(), first: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: {
      prepare: (sql: string) => {
        state.sql = sql;
        return { bind: () => ({ all: state.all, first: state.first }) };
      },
    },
  }),
}));

import { findSlideshowMediaKey, listSlideshowMedia } from "./slideshows";

describe("slideshow quality gate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists only effective best/good media", async () => {
    state.all.mockResolvedValue({ results: [] });
    await listSlideshowMedia("event-1");
    expect(state.sql).toContain("COALESCE(quality_override, quality_category) IN ('best', 'good')");
  });

  it("also protects direct slideshow image delivery", async () => {
    state.first.mockResolvedValue(null);
    await expect(findSlideshowMediaKey("token", "photo")).resolves.toBeNull();
    expect(state.sql).toContain("COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')");
  });
});
