import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findPublicEvent: vi.fn(),
  listMediaComments: vi.fn(),
  createMediaComment: vi.fn(),
}));
vi.mock("@/lib/repositories/events", () => ({ findPublicEvent: state.findPublicEvent }));
vi.mock("@/lib/repositories/media-comments", () => ({
  listMediaComments: state.listMediaComments,
  createMediaComment: state.createMediaComment,
}));

import { GET, POST } from "./route";

const context = { params: Promise.resolve({ slug: "poroka", publicId: "photo_public_1" }) };

describe("public media comments route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findPublicEvent.mockResolvedValue({ id: "event-1", comments_enabled: 1 });
    state.listMediaComments.mockResolvedValue([]);
    state.createMediaComment.mockResolvedValue({
      status: "created",
      comment: { id: "comment-1", guestId: "guest_0123456789abcdef", displayName: "Barbara", body: "Čudovito!", createdAt: "2026-07-18T20:00:00Z" },
    });
  });

  it("lists comments only after resolving the public event scope", async () => {
    const response = await GET(new Request("https://example.test"), context);
    expect(response.status).toBe(200);
    expect(state.listMediaComments).toHaveBeenCalledWith("event-1", "photo_public_1");
  });

  it("validates and creates a comment for an event guest", async () => {
    const response = await POST(new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ guestId: "guest_0123456789abcdef", body: "Čudovito!" }),
    }), context);
    expect(response.status).toBe(201);
    expect(state.createMediaComment).toHaveBeenCalledWith("event-1", "photo_public_1", {
      guestId: "guest_0123456789abcdef",
      body: "Čudovito!",
    });
  });

  it("rejects invalid or cross-event guest identity", async () => {
    const invalid = await POST(new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ guestId: "wrong", body: "Komentar" }),
    }), context);
    expect(invalid.status).toBe(422);

    state.createMediaComment.mockResolvedValue({ status: "guest_not_found" });
    const foreign = await POST(new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ guestId: "guest_0123456789abcdef", body: "Komentar" }),
    }), context);
    expect(foreign.status).toBe(403);
  });

  it("returns a retry hint when the guest comments too quickly", async () => {
    state.createMediaComment.mockResolvedValue({ status: "rate_limited" });
    const response = await POST(new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ guestId: "guest_0123456789abcdef", body: "Komentar" }),
    }), context);
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
  });

  it("blocks reads and writes when comments are disabled for the event", async () => {
    state.findPublicEvent.mockResolvedValue({ id: "event-1", comments_enabled: 0 });
    const getResponse = await GET(new Request("https://example.test"), context);
    const postResponse = await POST(new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ guestId: "guest_0123456789abcdef", body: "Komentar" }),
    }), context);

    expect(getResponse.status).toBe(403);
    expect(postResponse.status).toBe(403);
    expect(state.listMediaComments).not.toHaveBeenCalled();
    expect(state.createMediaComment).not.toHaveBeenCalled();
  });
});
