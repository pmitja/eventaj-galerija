import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findSlideshowMediaKey: vi.fn(),
  hashToken: vi.fn(),
  get: vi.fn(),
}));

vi.mock("@/lib/repositories/slideshows", () => ({ findSlideshowMediaKey: state.findSlideshowMediaKey }));
vi.mock("@/lib/security/tokens", () => ({ hashToken: state.hashToken }));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ MEDIA: { get: state.get } }) }));

import { GET } from "./route";

function requestImage() {
  return GET(new Request("https://example.test/api/v1/display/secret/media/photo-1"), {
    params: Promise.resolve({ token: "secret", publicId: "photo-1" }),
  });
}

describe("display image route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.hashToken.mockResolvedValue("hash");
    state.findSlideshowMediaKey.mockResolvedValue("derived/event/photo/gallery.webp");
    state.get.mockResolvedValue({
      body: new Blob(["image"]).stream(),
      httpEtag: '"etag"',
      writeHttpMetadata(headers: Headers) { headers.set("content-type", "image/webp"); },
    });
  });

  it("keeps token-protected media out of the public CDN cache", async () => {
    const response = await requestImage();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(state.findSlideshowMediaKey).toHaveBeenCalledWith("hash", "photo-1");
  });
});
