import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  all: vi.fn(),
  bind: vi.fn(),
  cacheOptions: undefined as undefined | { tags?: string[]; revalidate?: number | false },
  keyParts: undefined as undefined | string[],
}));

vi.mock("next/cache", () => ({
  unstable_cache: (
    callback: () => Promise<unknown>,
    keyParts: string[],
    options: { tags?: string[]; revalidate?: number | false },
  ) => {
    state.keyParts = keyParts;
    state.cacheOptions = options;
    return callback;
  },
  revalidateTag: vi.fn(),
}));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: {
      prepare: () => ({
        bind: (...values: unknown[]) => {
          state.bind(...values);
          return { all: state.all };
        },
      }),
    },
  }),
}));

import { listPublicGalleryMedia } from "./public-gallery";

describe("public gallery repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.cacheOptions = undefined;
    state.keyParts = undefined;
  });

  it("caches each event independently with its invalidation tag", async () => {
    state.all.mockResolvedValue({ results: [{ public_id: "photo-1" }] });

    const result = await listPublicGalleryMedia("event-1");

    expect(result).toEqual([{ public_id: "photo-1" }]);
    expect(state.bind).toHaveBeenCalledWith("event-1");
    expect(state.keyParts).toEqual(["public-gallery-media", "event-1"]);
    expect(state.cacheOptions).toEqual({
      tags: ["public-gallery:event-1"],
      revalidate: 3600,
    });
  });
});
