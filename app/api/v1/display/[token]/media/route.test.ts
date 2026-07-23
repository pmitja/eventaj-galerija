import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findPublicSlideshow: vi.fn(),
  listSlideshowMedia: vi.fn(),
  hashToken: vi.fn(),
  getEngagementSnapshot: vi.fn(),
  listLiveMediaComments: vi.fn(),
  listSlideMediaComments: vi.fn(),
}));

vi.mock("@/lib/repositories/slideshows", () => ({
  findPublicSlideshow: state.findPublicSlideshow,
  listSlideshowMedia: state.listSlideshowMedia,
}));
vi.mock("@/lib/security/tokens", () => ({ hashToken: state.hashToken }));
vi.mock("@/lib/repositories/engagement", () => ({ getEngagementSnapshot: state.getEngagementSnapshot }));
vi.mock("@/lib/repositories/media-comments", () => ({
  listLiveMediaComments: state.listLiveMediaComments,
  listSlideMediaComments: state.listSlideMediaComments,
}));

import { GET } from "./route";

function requestMedia(token = "secret") {
  return GET(new Request(`https://example.test/api/v1/display/${token}/media`), {
    params: Promise.resolve({ token }),
  });
}

describe("display playlist route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.hashToken.mockResolvedValue("hash");
    state.findPublicSlideshow.mockResolvedValue({ event_id: "event-1", event_name: "Poroka" });
    state.listSlideshowMedia.mockResolvedValue([{ public_id: "photo-1", original_filename: "photo.jpg", uploaded_at: "2026-07-16T12:00:00Z" }]);
    state.getEngagementSnapshot.mockResolvedValue({ leaderboard: [], stats: { acceptedPhotos: 1, contributors: 0 }, events: [] });
    state.listLiveMediaComments.mockResolvedValue([{
      id: "comment-1", displayName: "Barbara", body: "Čudovito!", createdAt: "2026-07-18T20:00:00Z",
      mediaPublicId: "photo-1", mediaFilename: "photo.jpg",
    }]);
    state.listSlideMediaComments.mockResolvedValue({});
  });

  it("rejects an unknown or rotated token", async () => {
    state.findPublicSlideshow.mockResolvedValue(null);
    const response = await requestMedia("old-token");
    expect(response.status).toBe(404);
    expect(state.listSlideshowMedia).not.toHaveBeenCalled();
  });

  it("returns only the token-scoped live playlist without caching", async () => {
    const response = await requestMedia();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(state.hashToken).toHaveBeenCalledWith("secret");
    expect(await response.json()).toEqual({
      event: { name: "Poroka" },
      media: [{
        publicId: "photo-1",
        filename: "photo.jpg",
        uploadedAt: "2026-07-16T12:00:00Z",
        imageUrl: "/api/v1/display/secret/media/photo-1",
        comments: [],
      }],
      engagement: { leaderboard: [], stats: { acceptedPhotos: 1, contributors: 0 }, events: [] },
      comments: [{ id: "comment-1", displayName: "Barbara", body: "Čudovito!", createdAt: "2026-07-18T20:00:00Z", mediaPublicId: "photo-1", mediaFilename: "photo.jpg" }],
    });
  });

  it("loads live comments for the token-scoped event", async () => {
    await requestMedia();
    expect(state.listLiveMediaComments).toHaveBeenCalledWith("event-1");
    expect(state.listSlideMediaComments).toHaveBeenCalledWith("event-1");
  });
});
