import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findPublicEvent: vi.fn(),
  createUploadSession: vi.fn(),
  findActiveAccessPoint: vi.fn(),
  createPublicToken: vi.fn(),
  hashToken: vi.fn(),
  guestBelongsToEvent: vi.fn(),
}));
vi.mock("@/lib/repositories/events", () => ({ findPublicEvent: state.findPublicEvent }));
vi.mock("@/lib/repositories/uploads", () => ({ createUploadSession: state.createUploadSession }));
vi.mock("@/lib/repositories/access-points", () => ({ findActiveAccessPoint: state.findActiveAccessPoint }));
vi.mock("@/lib/security/tokens", () => ({ createPublicToken: state.createPublicToken, hashToken: state.hashToken }));
vi.mock("@/lib/repositories/guest-identities", () => ({ guestBelongsToEvent: state.guestBelongsToEvent }));

import { POST } from "./route";

function createSession(guestId?: string) {
  return POST(new Request("https://example.test/api/v1/events/poroka/upload-sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(guestId ? { guestId } : {}),
  }), { params: Promise.resolve({ slug: "poroka" }) });
}

describe("guest-scoped upload session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findPublicEvent.mockResolvedValue({
      id: "event-1", organization_id: "org-1", uploads_enabled: 1,
      ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    state.findActiveAccessPoint.mockResolvedValue(null);
    state.createPublicToken.mockReturnValue("token");
    state.hashToken.mockResolvedValue("hash");
    state.guestBelongsToEvent.mockResolvedValue(true);
    state.createUploadSession.mockResolvedValue({ expires_at: "2026-07-18T20:15:00.000Z" });
  });

  it("binds a registered event guest to the new upload session", async () => {
    const response = await createSession("guest_0123456789abcdef");
    expect(response.status).toBe(201);
    expect(state.guestBelongsToEvent).toHaveBeenCalledWith("event-1", "guest_0123456789abcdef");
    expect(state.createUploadSession).toHaveBeenCalledWith("event-1", "org-1", "hash", null, "guest_0123456789abcdef");
  });

  it("rejects a guest id that is not registered for this event", async () => {
    state.guestBelongsToEvent.mockResolvedValue(false);
    const response = await createSession("guest_0123456789abcdef");
    expect(response.status).toBe(409);
    expect(state.createUploadSession).not.toHaveBeenCalled();
  });

  it("keeps old clients without a guest id backward compatible", async () => {
    const response = await createSession();
    expect(response.status).toBe(201);
    expect(state.createUploadSession).toHaveBeenCalledWith("event-1", "org-1", "hash", null, null);
  });

  it("still accepts uploads within 24 hours after the event ends", async () => {
    state.findPublicEvent.mockResolvedValue({
      id: "event-1", organization_id: "org-1", uploads_enabled: 1,
      ends_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    });
    const response = await createSession("guest_0123456789abcdef");
    expect(response.status).toBe(201);
    expect(state.createUploadSession).toHaveBeenCalled();
  });

  it("closes uploads more than 24 hours after the event ends", async () => {
    state.findPublicEvent.mockResolvedValue({
      id: "event-1", organization_id: "org-1", uploads_enabled: 1,
      ends_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    });
    const response = await createSession("guest_0123456789abcdef");
    expect(response.status).toBe(410);
    expect(state.createUploadSession).not.toHaveBeenCalled();
  });
});
