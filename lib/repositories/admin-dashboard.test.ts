import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ prepare: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ DB: { prepare: state.prepare } }) }));

import { listAdminEventSummaries } from "./admin-dashboard";

describe("admin event summaries", () => {
  let db: DatabaseSync;
  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE events (id TEXT, organization_id TEXT, public_slug TEXT, name TEXT, location TEXT, starts_at TEXT, timezone TEXT, status TEXT, comments_enabled INTEGER);
      CREATE TABLE media_files (event_id TEXT, status TEXT);
      CREATE TABLE visits (event_id TEXT);
    `);
    const insert = db.prepare("INSERT INTO events VALUES (?, ?, ?, ?, NULL, ?, 'UTC', 'active', 1)");
    for (let index = 0; index < 101; index++) {
      insert.run(`event-${index}`, "organization-1", `slug-${index}`, `Event ${index}`, new Date(Date.UTC(2026, 0, index + 1)).toISOString());
    }
    insert.run("other-event", "organization-2", "other", "Private event", "2027-01-01T00:00:00Z");
    state.prepare.mockImplementation((sql: string) => ({
      bind: (...values: (string | number)[]) => ({ all: async () => ({ results: db.prepare(sql).all(...values) }) }),
    }));
  });
  afterEach(() => db.close());

  it("loads events beyond the old 100-event cap while retaining tenant isolation", async () => {
    const result = await listAdminEventSummaries("organization-1", null);
    expect(result).toHaveLength(101);
    expect(result.at(-1)?.id).toBe("event-0");
    expect(result.some((event) => event.id === "other-event")).toBe(false);
  });

  it("preserves the dashboard limit and descending event-date order", async () => {
    expect((await listAdminEventSummaries("organization-1", 3)).map((event) => event.id)).toEqual(["event-100", "event-99", "event-98"]);
    expect(await listAdminEventSummaries("organization-1")).toHaveLength(100);
  });
});
