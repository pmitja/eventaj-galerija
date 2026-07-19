import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ sql: "", bindings: [] as unknown[] }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({
  DB: {
    prepare: (sql: string) => {
      state.sql = sql;
      return { bind: (...bindings: unknown[]) => {
        state.bindings = bindings;
        return { all: async () => ({ results: [] }) };
      } };
    },
  },
}) }));

import { listFaceSearchMatches } from "./face-search";

describe("public face search result isolation", () => {
  it("requires event, organization, publication, visibility and quality gates", async () => {
    await listFaceSearchMatches({
      id: "session-1",
      event_id: "event-1",
      public_slug: "poroka",
      organization_id: "org-1",
      guest_id: "guest_0123456789abcdef",
      consent_record_id: "consent-1",
      selfie_object_key: null,
      declared_mime: "image/jpeg",
      size_bytes: 100,
      status: "completed",
      attempt_count: 1,
      error_code: null,
      expires_at: "2026-07-19T10:15:00.000Z",
      completed_at: "2026-07-19T10:01:00.000Z",
    });
    expect(state.sql).toContain("fsm.session_id = ? AND m.event_id = ? AND e.organization_id = ?");
    expect(state.sql).toContain("m.gallery_state = 'visible'");
    expect(state.sql).toContain("m.publication_consent = 1");
    expect(state.sql).toContain("IN ('best', 'good')");
    expect(state.bindings).toEqual(["session-1", "event-1", "org-1"]);
  });
});
