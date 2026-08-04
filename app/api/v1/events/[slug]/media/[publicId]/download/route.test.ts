import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ first: vi.fn(), sign: vi.fn(), sql: "" }));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({ DB: { prepare: (sql: string) => {
    state.sql = sql;
    return { bind: () => ({ first: state.first }) };
  } } }),
}));
vi.mock("@/lib/storage/r2", () => ({ createPresignedDownloadUrl: state.sign }));

import { GET } from "./route";

describe("individual public photo download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.first.mockResolvedValue({ object_key: "originals/event/photo/original", original_filename: "poročna.jpg" });
    state.sign.mockResolvedValue("https://downloads.example.test/signed");
  });

  it("rechecks the publication and quality gates before signing the original", async () => {
    const response = await GET(new Request("https://example.test/download"), {
      params: Promise.resolve({ slug: "poroka", publicId: "photo-public-id" }),
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://downloads.example.test/signed");
    expect(state.sql).toContain("m.kind = 'image'");
    expect(state.sql).toContain("m.publication_consent = 1");
    expect(state.sql).toContain("COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')");
    expect(state.sign).toHaveBeenCalledWith("originals/event/photo/original", "poročna.jpg");
  });

  it("does not reveal a non-public original", async () => {
    state.first.mockResolvedValue(null);
    const response = await GET(new Request("https://example.test/download"), {
      params: Promise.resolve({ slug: "poroka", publicId: "hidden" }),
    });
    expect(response.status).toBe(404);
    expect(state.sign).not.toHaveBeenCalled();
  });
});
