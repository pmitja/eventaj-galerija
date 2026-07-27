import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  auth: vi.fn(),
  findEventById: vi.fn(),
  ensureOwnedSlideshow: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: state.auth }));
vi.mock("@/lib/repositories/events", () => ({ findEventById: state.findEventById }));
vi.mock("@/lib/repositories/slideshows", () => ({
  ensureOwnedSlideshow: state.ensureOwnedSlideshow,
}));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    PUBLIC_APP_URL: "https://gallery.example.test",
  }),
}));

import { GET } from "./route";

function readRequest() {
  return GET(new Request("https://gallery.example.test/api/v1/admin/events/event-1/slideshow"), {
    params: Promise.resolve({ eventId: "event-1" }),
  });
}

describe("admin slideshow route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.auth.mockResolvedValue({ user: { email: "admin@example.test" } });
    state.findEventById.mockResolvedValue({ id: "event-1" });
    state.ensureOwnedSlideshow.mockResolvedValue({
      id: "show-1",
      access_token: "stable-secret-token",
      created_at: "2026-07-16T12:00:00Z",
    });
  });

  it("requires authentication before returning the stable link", async () => {
    state.auth.mockResolvedValue(null);
    const response = await readRequest();
    expect(response.status).toBe(401);
    expect(state.ensureOwnedSlideshow).not.toHaveBeenCalled();
  });

  it("returns the same organization-scoped event link without rotation", async () => {
    const response = await readRequest();
    expect(response.status).toBe(200);
    expect(state.findEventById).toHaveBeenCalledWith("event-1", "eventaj");
    expect(state.ensureOwnedSlideshow).toHaveBeenCalledWith("event-1", "eventaj");
    expect(await response.json()).toEqual({ slideshow: {
      url: "https://gallery.example.test/display/stable-secret-token",
      createdAt: "2026-07-16T12:00:00Z",
    } });
  });
});
