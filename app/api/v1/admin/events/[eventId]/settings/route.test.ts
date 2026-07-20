import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  auth: vi.fn(),
  findEventById: vi.fn(),
  updateEventCommentsEnabled: vi.fn(),
  run: vi.fn(),
  bind: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: state.auth }));
vi.mock("@/lib/repositories/events", () => ({
  findEventById: state.findEventById,
  updateEventCommentsEnabled: state.updateEventCommentsEnabled,
}));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: { prepare: () => ({ bind: (...values: unknown[]) => { state.bind(...values); return { run: state.run }; } }) },
  }),
}));

import { PATCH } from "./route";

function updateRequest(commentsEnabled = false, origin = "https://gallery.example.test") {
  return PATCH(new Request("https://gallery.example.test/api/v1/admin/events/event-1/settings", {
    method: "PATCH",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ commentsEnabled }),
  }), { params: Promise.resolve({ eventId: "event-1" }) });
}

describe("admin event settings route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.auth.mockResolvedValue({ user: { email: "admin@example.test" } });
    state.findEventById.mockResolvedValue({ id: "event-1" });
    state.updateEventCommentsEnabled.mockResolvedValue(true);
    state.run.mockResolvedValue({ meta: { changes: 1 } });
  });

  it("requires authentication", async () => {
    state.auth.mockResolvedValue(null);
    expect((await updateRequest()).status).toBe(401);
    expect(state.updateEventCommentsEnabled).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin mutation", async () => {
    expect((await updateRequest(false, "https://evil.example")).status).toBe(403);
    expect(state.findEventById).not.toHaveBeenCalled();
  });

  it("updates only an organization-scoped event and writes an audit event", async () => {
    const response = await updateRequest(false);
    expect(response.status).toBe(200);
    expect(state.findEventById).toHaveBeenCalledWith("event-1", "eventaj");
    expect(state.updateEventCommentsEnabled).toHaveBeenCalledWith("event-1", false, "eventaj");
    expect(state.bind).toHaveBeenCalledWith(
      expect.any(String), "event-1", "admin@example.test", "event-1",
      JSON.stringify({ commentsEnabled: false }), expect.any(String),
    );
    expect(await response.json()).toEqual({ settings: { commentsEnabled: false } });
  });
});
