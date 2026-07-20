import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findPublicEvent: vi.fn(),
  hasEntitlement: vi.fn(),
  guestBelongs: vi.fn(),
  countRecent: vi.fn(),
  createReSearch: vi.fn(),
  prepareSearch: vi.fn(),
  markEnqueued: vi.fn(),
  createToken: vi.fn(),
  hashToken: vi.fn(),
  send: vi.fn(),
  sendBatch: vi.fn(),
}));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({
  FACE_SEARCH_ENABLED: "true",
  FACE_SEARCH_POLICY_VERSION: "2026-07-20",
  FACE_PROCESSING_QUEUE: { send: state.send, sendBatch: state.sendBatch },
}) }));
vi.mock("@/lib/repositories/events", () => ({ findPublicEvent: state.findPublicEvent }));
vi.mock("@/lib/repositories/guest-identities", () => ({ guestBelongsToEvent: state.guestBelongs }));
vi.mock("@/lib/repositories/face-search", () => ({
  hasFaceCollectionsEntitlement: state.hasEntitlement,
  countRecentFaceSearchSessions: state.countRecent,
  createFaceReSearchSession: state.createReSearch,
  prepareFaceSearch: state.prepareSearch,
  markFaceJobsEnqueued: state.markEnqueued,
}));
vi.mock("@/lib/security/tokens", () => ({ createPublicToken: state.createToken, hashToken: state.hashToken }));

import { POST } from "./route";

function request(overrides: Record<string, unknown> = {}) {
  return POST(new Request("https://example.test/api/v1/events/poroka/face-search-sessions/re-search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ guestId: "guest_0123456789abcdef", policyVersion: "2026-07-20", ...overrides }),
  }), { params: Promise.resolve({ slug: "poroka" }) });
}

describe("face re-search session creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findPublicEvent.mockResolvedValue({ id: "event-1", organization_id: "org-1" });
    state.hasEntitlement.mockResolvedValue(true);
    state.guestBelongs.mockResolvedValue(true);
    state.countRecent.mockResolvedValue(0);
    state.createToken.mockReturnValue("secret-token");
    state.hashToken.mockResolvedValue("token-hash");
    state.prepareSearch.mockResolvedValue([]);
    state.createReSearch.mockResolvedValue({ id: "session-1", event_id: "event-1", organization_id: "org-1", expires_at: "2026-07-20T10:15:00.000Z" });
  });

  it("requires the current policy version", async () => {
    expect((await request({ policyVersion: "2026-07-19" })).status).toBe(409);
    expect(state.createReSearch).not.toHaveBeenCalled();
  });

  it("falls back with FACE_PROBE_MISSING when no stored face exists", async () => {
    state.createReSearch.mockResolvedValue(null);
    const response = await request();
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "FACE_PROBE_MISSING" });
    expect(state.send).not.toHaveBeenCalled();
  });

  it("queues a search without a selfie upload when a probe exists", async () => {
    const response = await request();
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ token: "secret-token", status: "queued" });
    expect(state.send).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "search", sessionId: "session-1" }),
      expect.anything(),
    );
  });
});
