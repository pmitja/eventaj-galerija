import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  authenticated: true,
  eventExists: true,
  requestResult: "queued" as "queued" | "already_pending" | "not_found",
  waitUntil: vi.fn(),
  processTechnicalAnalysis: vi.fn(),
  requestTechnicalAnalysis: vi.fn(),
  setMediaQualityOverride: vi.fn(),
  auditRun: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => state.authenticated ? { user: { email: "admin@eventaj.si" } } : null),
}));
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({ ctx: { waitUntil: state.waitUntil } }),
}));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    ORGANIZATION_ID: "eventaj",
    DB: { prepare: () => ({ bind: () => ({ run: state.auditRun }) }) },
  }),
}));
vi.mock("@/lib/repositories/events", () => ({
  findEventById: vi.fn(async () => state.eventExists ? { id: "event" } : null),
}));
vi.mock("@/lib/repositories/entitlements", () => ({
  hasAiBestPhotosEntitlement: vi.fn(async () => true),
}));
vi.mock("@/lib/repositories/media-quality-admin", () => ({
  requestTechnicalAnalysis: state.requestTechnicalAnalysis,
  setMediaQualityOverride: state.setMediaQualityOverride,
}));
vi.mock("@/lib/storage/r2", () => ({ processTechnicalAnalysis: state.processTechnicalAnalysis }));

import { PATCH, POST } from "./route";

const eventId = "0675d4a4-87f3-4f40-a98e-480184f64173";
const mediaId = "4ff3d2e1-63fb-4d88-a07e-148f06690e44";
const context = { params: Promise.resolve({ eventId, mediaId }) };

describe("admin media quality route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.authenticated = true;
    state.eventExists = true;
    state.requestResult = "queued";
    state.requestTechnicalAnalysis.mockImplementation(async () => state.requestResult);
    state.processTechnicalAnalysis.mockResolvedValue("completed");
    state.setMediaQualityOverride.mockResolvedValue({ automatic: "good", effective: "best" });
    state.auditRun.mockResolvedValue({ meta: { changes: 1 } });
  });

  it("queues one tenant-scoped retry and records an audit event", async () => {
    const response = await POST(new Request("https://example.test/api/quality", { method: "POST" }), context);
    expect(response.status).toBe(202);
    expect(state.requestTechnicalAnalysis).toHaveBeenCalledWith({
      organizationId: "eventaj",
      eventId,
      mediaId,
    });
    expect(state.processTechnicalAnalysis).toHaveBeenCalledWith(mediaId, "eventaj");
    expect(state.waitUntil).toHaveBeenCalledOnce();
    expect(state.auditRun).toHaveBeenCalledOnce();
  });

  it("does not schedule duplicate work while analysis is pending", async () => {
    state.requestResult = "already_pending";
    const response = await POST(new Request("https://example.test/api/quality", { method: "POST" }), context);
    expect(response.status).toBe(202);
    expect(state.processTechnicalAnalysis).not.toHaveBeenCalled();
    expect(state.waitUntil).not.toHaveBeenCalled();
  });

  it("persists a manual category override and audits it", async () => {
    const response = await PATCH(new Request("https://example.test/api/quality", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category: "best" }),
    }), context);
    expect(response.status).toBe(200);
    expect(state.setMediaQualityOverride).toHaveBeenCalledWith(expect.objectContaining({
      organizationId: "eventaj",
      eventId,
      mediaId,
      category: "best",
      actorId: "admin@eventaj.si",
    }));
    expect(state.auditRun).toHaveBeenCalledOnce();
  });

  it("rejects unauthenticated retries", async () => {
    state.authenticated = false;
    const response = await POST(new Request("https://example.test/api/quality", { method: "POST" }), context);
    expect(response.status).toBe(401);
    expect(state.requestTechnicalAnalysis).not.toHaveBeenCalled();
  });
});
