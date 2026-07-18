import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ sql: "", first: vi.fn() }));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: {
      prepare: (sql: string) => {
        state.sql = sql;
        return { bind: () => ({ first: state.first }) };
      },
    },
    MEDIA: { get: vi.fn() },
  }),
}));

import { GET } from "./route";

describe("public media delivery", () => {
  it("does not resolve media outside the best/good quality gate", async () => {
    state.first.mockResolvedValue(null);
    const response = await GET(
      new Request("https://example.com/api/v1/events/event/media/photo"),
      { params: Promise.resolve({ slug: "event", publicId: "photo" }) },
    );
    expect(response.status).toBe(404);
    expect(state.sql).toContain("COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')");
  });
});
