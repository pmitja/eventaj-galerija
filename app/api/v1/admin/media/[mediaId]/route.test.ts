import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  auth: vi.fn(),
  first: vi.fn(),
  get: vi.fn(),
  bind: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: state.auth }));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    ORGANIZATION_ID: "organization-1",
    DB: {
      prepare: () => ({
        bind: (...values: unknown[]) => {
          state.bind(...values);
          return { first: state.first };
        },
      }),
    },
    MEDIA: { get: state.get },
  }),
}));

import { GET } from "./route";

function requestMedia(mediaId = "media-1") {
  return GET(new Request(`https://example.test/api/v1/admin/media/${mediaId}`), {
    params: Promise.resolve({ mediaId }),
  });
}

describe("admin media delivery route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.auth.mockResolvedValue({ user: { email: "admin@example.test" } });
  });

  it("rejects unauthenticated thumbnail reads before accessing data", async () => {
    state.auth.mockResolvedValue(null);

    const response = await requestMedia();

    expect(response.status).toBe(401);
    expect(state.first).not.toHaveBeenCalled();
    expect(state.get).not.toHaveBeenCalled();
  });

  it("scopes the media lookup to the active organization", async () => {
    state.first.mockResolvedValue(null);

    const response = await requestMedia("foreign-media");

    expect(response.status).toBe(404);
    expect(state.bind).toHaveBeenCalledWith("foreign-media", "organization-1");
    expect(state.get).not.toHaveBeenCalled();
  });

  it("streams an owned ready thumbnail with private caching", async () => {
    state.first.mockResolvedValue({ thumbnail_key: "derived/event/media/thumbnail.webp" });
    state.get.mockResolvedValue({
      body: new Blob(["thumbnail"]).stream(),
      httpEtag: '"etag-1"',
      writeHttpMetadata(headers: Headers) { headers.set("content-type", "image/webp"); },
    });

    const response = await requestMedia();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, max-age=300");
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(state.get).toHaveBeenCalledWith("derived/event/media/thumbnail.webp");
  });
});
