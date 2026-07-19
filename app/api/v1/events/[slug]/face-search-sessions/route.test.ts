import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  findPublicEvent: vi.fn(),
  hasEntitlement: vi.fn(),
  guestBelongs: vi.fn(),
  countRecent: vi.fn(),
  createSession: vi.fn(),
  createToken: vi.fn(),
  hashToken: vi.fn(),
  createUploadUrl: vi.fn(),
}));
vi.mock("@/lib/cloudflare", () => ({ getCloudflareEnv: () => ({ FACE_SEARCH_ENABLED: "true", FACE_SEARCH_POLICY_VERSION: "2026-07-19" }) }));
vi.mock("@/lib/repositories/events", () => ({ findPublicEvent: state.findPublicEvent }));
vi.mock("@/lib/repositories/guest-identities", () => ({ guestBelongsToEvent: state.guestBelongs }));
vi.mock("@/lib/repositories/face-search", () => ({
  hasFaceCollectionsEntitlement: state.hasEntitlement,
  countRecentFaceSearchSessions: state.countRecent,
  createFaceSearchSession: state.createSession,
}));
vi.mock("@/lib/security/tokens", () => ({ createPublicToken: state.createToken, hashToken: state.hashToken }));
vi.mock("@/lib/storage/r2", () => ({ createPresignedUploadUrl: state.createUploadUrl, PRESIGNED_UPLOAD_TTL_SECONDS: 600 }));

import { POST } from "./route";

function request(overrides: Record<string, unknown> = {}) {
  return POST(new Request("https://example.test/api/v1/events/poroka/face-search-sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      guestId: "guest_0123456789abcdef",
      filename: "selfie.jpg",
      mime: "image/jpeg",
      sizeBytes: 1000,
      consent: true,
      policyVersion: "2026-07-19",
      ...overrides,
    }),
  }), { params: Promise.resolve({ slug: "poroka" }) });
}

describe("face search session creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.findPublicEvent.mockResolvedValue({ id: "event-1", organization_id: "org-1" });
    state.hasEntitlement.mockResolvedValue(true);
    state.guestBelongs.mockResolvedValue(true);
    state.countRecent.mockResolvedValue(0);
    state.createToken.mockReturnValue("secret-token");
    state.hashToken.mockResolvedValue("token-hash");
    state.createUploadUrl.mockResolvedValue("https://r2.example/upload");
    state.createSession.mockResolvedValue({ expires_at: "2026-07-19T10:15:00.000Z" });
  });

  it("requires the event entitlement", async () => {
    state.hasEntitlement.mockResolvedValue(false);
    expect((await request()).status).toBe(403);
    expect(state.createSession).not.toHaveBeenCalled();
  });

  it("requires explicit current-policy consent", async () => {
    expect((await request({ consent: false })).status).toBe(422);
    expect((await request({ policyVersion: "old" })).status).toBe(409);
  });

  it("creates an event and guest-scoped ephemeral direct upload", async () => {
    const response = await request();
    expect(response.status).toBe(201);
    expect(state.createSession).toHaveBeenCalledWith(expect.objectContaining({
      eventId: "event-1",
      organizationId: "org-1",
      guestId: "guest_0123456789abcdef",
      tokenHash: "token-hash",
      mime: "image/jpeg",
    }));
  });
});
