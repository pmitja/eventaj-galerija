import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findPublicEvent: vi.fn(),
  listPublicGalleryMedia: vi.fn(),
}));

vi.mock("@/lib/repositories/events", () => ({
  findPublicEvent: state.findPublicEvent,
}));
vi.mock("@/lib/repositories/public-gallery", () => ({
  listPublicGalleryMedia: state.listPublicGalleryMedia,
}));

import { dynamic, GET } from "./route";

function requestGallery(slug = "event-slug") {
  return GET(new Request(`https://example.test/api/v1/events/${slug}/media`), {
    params: Promise.resolve({ slug }),
  });
}

describe("public event gallery route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findPublicEvent.mockResolvedValue({ id: "event-1" });
    state.listPublicGalleryMedia.mockResolvedValue([
      {
        public_id: "photo-public-id",
        original_filename: "photo.jpg",
        uploaded_at: "2026-07-16T10:44:27.611Z",
        comment_count: 3,
      },
    ]);
  });

  it("is dynamic and prevents caching so newly processed photos become visible", async () => {
    const response = await requestGallery();

    expect(dynamic).toBe("force-dynamic");
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(state.listPublicGalleryMedia).toHaveBeenCalledWith("event-1");
    expect(await response.json()).toEqual({
      media: [{
        publicId: "photo-public-id",
        filename: "photo.jpg",
        uploadedAt: "2026-07-16T10:44:27.611Z",
        commentCount: 3,
        thumbnailUrl: "/api/v1/events/event-slug/media/photo-public-id?variant=thumbnail",
        imageUrl: "/api/v1/events/event-slug/media/photo-public-id?variant=gallery",
      }],
    });
  });
});
