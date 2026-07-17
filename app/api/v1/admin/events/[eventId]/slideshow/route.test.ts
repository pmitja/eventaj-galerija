import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  auth: vi.fn(),
  findEventById: vi.fn(),
  findOwnedSlideshow: vi.fn(),
  rotateSlideshow: vi.fn(),
  hashToken: vi.fn(),
  run: vi.fn(),
  bind: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: state.auth }));
vi.mock("@/lib/repositories/events", () => ({ findEventById: state.findEventById }));
vi.mock("@/lib/repositories/slideshows", () => ({
  findOwnedSlideshow: state.findOwnedSlideshow,
  rotateSlideshow: state.rotateSlideshow,
}));
vi.mock("@/lib/security/tokens", () => ({
  createPublicToken: () => "raw-secret-token",
  hashToken: state.hashToken,
}));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    PUBLIC_APP_URL: "https://gallery.example.test",
    DB: { prepare: () => ({ bind: (...values: unknown[]) => { state.bind(...values); return { run: state.run }; } }) },
  }),
}));

import { POST } from "./route";

function rotateRequest() {
  return POST(new Request("https://gallery.example.test/api/v1/admin/events/event-1/slideshow", {
    method: "POST",
    headers: { origin: "https://gallery.example.test" },
  }), { params: Promise.resolve({ eventId: "event-1" }) });
}

describe("admin slideshow route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.auth.mockResolvedValue({ user: { email: "admin@example.test" } });
    state.findEventById.mockResolvedValue({ id: "event-1" });
    state.hashToken.mockResolvedValue("hashed-token");
    state.rotateSlideshow.mockResolvedValue({ id: "show-1", rotated_at: "2026-07-16T12:00:00Z" });
    state.run.mockResolvedValue({ meta: { changes: 1 } });
  });

  it("requires authentication before rotating a token", async () => {
    state.auth.mockResolvedValue(null);
    const response = await rotateRequest();
    expect(response.status).toBe(401);
    expect(state.rotateSlideshow).not.toHaveBeenCalled();
  });

  it("uses an organization-scoped event lookup and stores only the token hash", async () => {
    const response = await rotateRequest();
    expect(response.status).toBe(201);
    expect(state.findEventById).toHaveBeenCalledWith("event-1");
    expect(state.hashToken).toHaveBeenCalledWith("raw-secret-token");
    expect(state.rotateSlideshow).toHaveBeenCalledWith("event-1", "hashed-token");
    expect(await response.json()).toEqual({ slideshow: {
      url: "https://gallery.example.test/display/raw-secret-token",
      rotatedAt: "2026-07-16T12:00:00Z",
    } });
  });
});
