import { beforeEach, describe, expect, it, vi } from "vitest";

const eventId = "11111111-1111-4111-8111-111111111111";
const backfillId = "22222222-2222-4222-8222-222222222222";
const state = vi.hoisted(() => ({
  session: { user: { email: "admin@example.com" } } as object | null,
  eventExists: true,
  queueSend: vi.fn(),
  auditRun: vi.fn(),
  markFailed: vi.fn(),
  created: true,
}));

const job = {
  id: backfillId,
  event_id: eventId,
  mode: "missing" as const,
  model_version: "technical-v2",
  status: "queued" as const,
  error_code: null,
  total_count: 0,
  completed_count: 0,
  failed_count: 0,
  queued_count: 0,
  created_at: "2026-07-17T08:00:00.000Z",
  updated_at: "2026-07-17T08:00:00.000Z",
  completed_at: null,
};

vi.mock("@/auth", () => ({ auth: vi.fn(async () => state.session) }));
vi.mock("@/lib/repositories/events", () => ({
  findEventById: vi.fn(async () => state.eventExists ? { id: eventId } : null),
}));
vi.mock("@/lib/repositories/quality-backfills", () => ({
  createQualityBackfill: vi.fn(async () => ({ job, created: state.created })),
  findLatestOwnedQualityBackfill: vi.fn(async () => job),
  markQualityBackfillEnqueueFailed: state.markFailed,
}));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    ORGANIZATION_ID: "eventaj",
    QUALITY_QUEUE: { send: state.queueSend },
    DB: { prepare: () => ({ bind: () => ({ run: state.auditRun }) }) },
  }),
}));

import { GET, POST } from "./route";

const context = { params: Promise.resolve({ eventId }) };

describe("quality backfill route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.session = { user: { email: "admin@example.com" } };
    state.eventExists = true;
    state.created = true;
    state.queueSend.mockResolvedValue(undefined);
    state.auditRun.mockResolvedValue({ meta: { changes: 1 } });
  });

  it("queues one tenant-scoped start message and writes an audit event", async () => {
    const response = await POST(new Request(`https://example.com/api/v1/admin/events/${eventId}/quality-backfill`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://example.com" },
      body: JSON.stringify({ mode: "missing" }),
    }), context);
    expect(response.status).toBe(202);
    expect(state.queueSend).toHaveBeenCalledWith({ type: "start", backfillId, organizationId: "eventaj" });
    expect(state.auditRun).toHaveBeenCalledOnce();
  });

  it("does not enqueue an already active job twice", async () => {
    state.created = false;
    const response = await POST(new Request(`https://example.com/api/v1/admin/events/${eventId}/quality-backfill`, {
      method: "POST",
      body: JSON.stringify({ mode: "all" }),
    }), context);
    expect(response.status).toBe(202);
    expect(state.queueSend).not.toHaveBeenCalled();
    expect(state.auditRun).not.toHaveBeenCalled();
  });

  it("marks the job failed when the queue is unavailable", async () => {
    state.queueSend.mockRejectedValue(new Error("queue unavailable"));
    const response = await POST(new Request(`https://example.com/api/v1/admin/events/${eventId}/quality-backfill`, {
      method: "POST",
      body: JSON.stringify({}),
    }), context);
    expect(response.status).toBe(503);
    expect(state.markFailed).toHaveBeenCalledWith(backfillId);
  });

  it("returns current progress without caching", async () => {
    const response = await GET(new Request(`https://example.com/api/v1/admin/events/${eventId}/quality-backfill`), context);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({ backfill: { id: backfillId, status: "queued" } });
  });
});
