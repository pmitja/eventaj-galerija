import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ sql: "", bindings: [] as unknown[], all: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: {
      prepare: (sql: string) => {
        state.sql = sql;
        return {
          bind: (...bindings: unknown[]) => {
            state.bindings = bindings;
            return { all: state.all };
          },
        };
      },
    },
  }),
}));

import { LIVE_COMMENT_LIMIT, MAX_SLIDE_COMMENTS } from "@/lib/domain/media-comments";
import { listLiveMediaComments, listSlideMediaComments } from "./media-comments";

describe("live slideshow comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.sql = "";
    state.bindings = [];
  });

  it("requires comments, guest consent and an approved publication-safe slideshow photo", async () => {
    state.all.mockResolvedValue({ results: [] });
    await listLiveMediaComments("event-1");

    expect(state.sql).toContain("e.comments_enabled = 1");
    expect(state.sql).toContain("c.status = 'visible'");
    expect(state.sql).toContain("g.show_on_live_screen = 1");
    expect(state.sql).toContain("m.slideshow_state = 'approved'");
    expect(state.sql).toContain("m.publication_consent = 1");
    expect(state.sql).toContain("COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')");
    expect(state.bindings[0]).toBe("event-1");
    expect(state.bindings[2]).toBe(LIVE_COMMENT_LIMIT);
  });

  it("returns the newest limited result set in chronological display order", async () => {
    state.all.mockResolvedValue({ results: [
      { id: "new", guest_id: "guest-1", display_name: "Nina", body: "Drugi", created_at: "2026-07-18T20:00:02Z", media_public_id: "photo-2", media_filename: "b.jpg" },
      { id: "old", guest_id: "guest-2", display_name: "Miha", body: "Prvi", created_at: "2026-07-18T20:00:01Z", media_public_id: "photo-1", media_filename: "a.jpg" },
    ] });

    await expect(listLiveMediaComments("event-1")).resolves.toEqual([
      { id: "old", displayName: "Miha", body: "Prvi", createdAt: "2026-07-18T20:00:01Z", mediaPublicId: "photo-1", mediaFilename: "a.jpg" },
      { id: "new", displayName: "Nina", body: "Drugi", createdAt: "2026-07-18T20:00:02Z", mediaPublicId: "photo-2", mediaFilename: "b.jpg" },
    ]);
  });
});

describe("per-slide comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.sql = "";
    state.bindings = [];
  });

  it("keeps the slideshow gating and caps at MAX_SLIDE_COMMENTS per photo", async () => {
    state.all.mockResolvedValue({ results: [] });
    await listSlideMediaComments("event-1");

    expect(state.sql).toContain("ROW_NUMBER() OVER (PARTITION BY c.media_id ORDER BY c.created_at DESC)");
    expect(state.sql).toContain("WHERE rn <= ?");
    expect(state.sql).toContain("e.comments_enabled = 1");
    expect(state.sql).toContain("g.show_on_live_screen = 1");
    expect(state.sql).toContain("m.slideshow_state = 'approved'");
    expect(state.bindings).toEqual(["event-1", MAX_SLIDE_COMMENTS]);
  });

  it("groups comments by their photo in chronological order", async () => {
    state.all.mockResolvedValue({ results: [
      { id: "a1", display_name: "Miha", body: "Prvi", created_at: "2026-07-18T20:00:01Z", media_public_id: "photo-1", media_filename: "a.jpg" },
      { id: "a2", display_name: "Nina", body: "Drugi", created_at: "2026-07-18T20:00:02Z", media_public_id: "photo-1", media_filename: "a.jpg" },
      { id: "b1", display_name: null, body: "Lep", created_at: "2026-07-18T20:00:03Z", media_public_id: "photo-2", media_filename: "b.jpg" },
    ] });

    await expect(listSlideMediaComments("event-1")).resolves.toEqual({
      "photo-1": [
        { id: "a1", displayName: "Miha", body: "Prvi", createdAt: "2026-07-18T20:00:01Z", mediaPublicId: "photo-1", mediaFilename: "a.jpg" },
        { id: "a2", displayName: "Nina", body: "Drugi", createdAt: "2026-07-18T20:00:02Z", mediaPublicId: "photo-1", mediaFilename: "a.jpg" },
      ],
      "photo-2": [
        { id: "b1", displayName: "Gost", body: "Lep", createdAt: "2026-07-18T20:00:03Z", mediaPublicId: "photo-2", mediaFilename: "b.jpg" },
      ],
    });
  });
});
