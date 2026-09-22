import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ prepare: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ DB: { prepare: state.prepare } }) }));

import { listPublicGalleryMedia } from "./public-gallery";

describe("complete public gallery", () => {
  let db: DatabaseSync;
  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE media_files (
        id TEXT, public_id TEXT, event_id TEXT, original_filename TEXT,
        uploaded_at TEXT, kind TEXT, duration_ms INTEGER, status TEXT,
        gallery_state TEXT, publication_consent INTEGER,
        quality_override TEXT, quality_category TEXT
      );
      CREATE TABLE media_comments (event_id TEXT, media_id TEXT, status TEXT);
    `);
    const insert = db.prepare(`INSERT INTO media_files VALUES
      (?, ?, 'event-1', 'photo.jpg', '2026-09-21T12:00:00.000Z', 'image', NULL,
       'ready', 'visible', 1, NULL, ?)`);
    for (let index = 0; index < 259; index++) {
      const id = `photo-${String(index).padStart(3, "0")}`;
      insert.run(id, id, index < 126 ? "best" : index < 234 ? "good" : "duplicate");
    }
    db.exec(`
      INSERT INTO media_comments VALUES ('event-1', 'photo-233', 'visible');
      INSERT INTO media_comments VALUES ('event-1', 'photo-233', 'hidden');
      INSERT INTO media_comments VALUES ('event-2', 'photo-233', 'visible');
    `);
    state.prepare.mockImplementation((sql: string) => ({
      bind: (...values: (string | number)[]) => ({ all: async () => ({ results: db.prepare(sql).all(...values) }) }),
    }));
  });
  afterEach(() => db.close());

  it("returns all 234 best/good photos beyond 100, with stable ordering and visible comments", async () => {
    const media = await listPublicGalleryMedia("event-1");
    expect(media).toHaveLength(234);
    expect(new Set(media.map((item) => item.public_id)).size).toBe(234);
    expect(media[0]).toMatchObject({ public_id: "photo-233", comment_count: 1 });
    expect(media.at(-1)?.public_id).toBe("photo-000");
  });

  it("preserves event scope, readiness, visibility, consent and quality overrides", async () => {
    db.exec(`
      UPDATE media_files SET event_id = 'event-2' WHERE id = 'photo-000';
      UPDATE media_files SET status = 'processing' WHERE id = 'photo-001';
      UPDATE media_files SET gallery_state = 'hidden' WHERE id = 'photo-002';
      UPDATE media_files SET publication_consent = 0 WHERE id = 'photo-003';
      UPDATE media_files SET quality_override = 'blurry' WHERE id = 'photo-004';
      UPDATE media_files SET quality_override = 'good' WHERE id = 'photo-234';
      UPDATE media_files SET quality_category = NULL WHERE id = 'photo-005';
    `);
    const ids = (await listPublicGalleryMedia("event-1")).map((item) => item.public_id);
    expect(ids).toHaveLength(229);
    for (let index = 0; index < 6; index++) expect(ids).not.toContain(`photo-00${index}`);
    expect(ids).toContain("photo-234");
    expect(await listPublicGalleryMedia("missing-event")).toEqual([]);
  });
});
