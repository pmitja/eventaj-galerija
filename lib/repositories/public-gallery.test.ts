import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  all: vi.fn(),
  bind: vi.fn(),
  sql: "",
}));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: {
      prepare: (sql: string) => {
        state.sql = sql;
        return {
        bind: (...values: unknown[]) => {
          state.bind(...values);
          return { all: state.all };
        },
        };
      },
    },
  }),
}));

import { listPublicGalleryMedia } from "./public-gallery";

describe("public gallery repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.sql = "";
  });

  it("returns only analyzed best/good media and keeps event scope", async () => {
    state.all.mockResolvedValue({ results: [{ public_id: "photo-1" }] });

    const result = await listPublicGalleryMedia("event-1");

    expect(result).toEqual([{ public_id: "photo-1" }]);
    expect(state.bind).toHaveBeenCalledWith("event-1");
    expect(state.sql).toContain("COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')");
    expect(state.sql).toContain("m.event_id = ?");
    expect(state.sql).toContain("c.status = 'visible'");
    expect(state.sql).toContain("c.media_id = m.id");
  });
});
