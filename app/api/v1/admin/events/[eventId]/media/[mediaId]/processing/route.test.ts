import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  authenticated: true,
  retryJob: vi.fn(),
  queueSend: vi.fn(),
  markEnqueued: vi.fn(),
  markEnqueueFailed: vi.fn(),
  auditRun: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => state.authenticated ? { user: { email: "admin@example.com" } } : null),
}));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    DB: { prepare: () => ({ bind: () => ({ run: state.auditRun }) }) },
    ORGANIZATION_ID: "eventaj",
    MEDIA_PROCESSING_QUEUE: { send: state.queueSend },
  }),
}));
vi.mock("@/lib/repositories/media-processing", () => ({
  retryFailedMediaProcessingJob: state.retryJob,
  markMediaProcessingEnqueued: state.markEnqueued,
  markMediaProcessingEnqueueFailed: state.markEnqueueFailed,
}));

import { POST } from "./route";

const eventId = "4ff3d2e1-63fb-4d88-a07e-148f06690e44";
const mediaId = "20e904d5-7f5b-4288-b0fc-43c5dceee4b4";
const context = { params: Promise.resolve({ eventId, mediaId }) };

describe("admin media processing retry route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.authenticated = true;
    state.retryJob.mockResolvedValue({ id: "job-1", media_file_id: mediaId, organization_id: "eventaj" });
    state.queueSend.mockResolvedValue(undefined);
    state.auditRun.mockResolvedValue({ meta: { changes: 1 } });
  });

  it("requires an authenticated administrator", async () => {
    state.authenticated = false;
    const response = await POST(new Request("https://example.test/retry", { method: "POST" }), context);
    expect(response.status).toBe(401);
    expect(state.retryJob).not.toHaveBeenCalled();
  });

  it("requeues only the tenant-scoped failed job and audits the action", async () => {
    const response = await POST(new Request("https://example.test/retry", { method: "POST" }), context);
    expect(response.status).toBe(202);
    expect(state.retryJob).toHaveBeenCalledWith(expect.anything(), { eventId, mediaId, organizationId: "eventaj" });
    expect(state.queueSend).toHaveBeenCalledWith({ jobId: "job-1", mediaId, organizationId: "eventaj" });
    expect(state.markEnqueued).toHaveBeenCalled();
    expect(state.auditRun).toHaveBeenCalled();
  });

  it("rejects cross-origin retry requests", async () => {
    const response = await POST(new Request("https://example.test/retry", {
      method: "POST",
      headers: { origin: "https://attacker.test" },
    }), context);
    expect(response.status).toBe(403);
    expect(state.retryJob).not.toHaveBeenCalled();
  });
});
