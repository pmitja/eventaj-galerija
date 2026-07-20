import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  auth: vi.fn(),
  findEventById: vi.fn(),
  createDownloadExport: vi.fn(),
  markDownloadExportFailed: vi.fn(),
  send: vi.fn(),
  auditRun: vi.fn(),
}));

const eventId = "67c96e75-6a7a-4d5f-9a1e-b2cf38edc279";
const exportId = "0a3fdaaa-684e-44a0-aa34-d6cdf3317699";

vi.mock("@/auth", () => ({ auth: state.auth }));
vi.mock("@/lib/repositories/events", () => ({ findEventById: state.findEventById }));
vi.mock("@/lib/repositories/exports", () => ({
  createDownloadExport: state.createDownloadExport,
  markDownloadExportFailed: state.markDownloadExportFailed,
}));
vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({
    EXPORT_QUEUE: { send: state.send },
    DB: { prepare: () => ({ bind: () => ({ run: state.auditRun }) }) },
  }),
}));

import { POST } from "./route";

function request() {
  return POST(new Request(`https://gallery.example.test/api/v1/admin/events/${eventId}/exports`, {
    method: "POST",
    headers: { origin: "https://gallery.example.test" },
  }), { params: Promise.resolve({ eventId }) });
}

describe("admin export creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.auth.mockResolvedValue({ user: { email: "admin@example.test" } });
    state.findEventById.mockResolvedValue({ id: eventId, name: "Poroka" });
    state.createDownloadExport.mockResolvedValue({
      id: exportId,
      status: "queued",
      file_name: "Poroka-20260716.zip",
      media_count: 3,
      created_at: "2026-07-16T12:00:00Z",
    });
    state.send.mockResolvedValue(undefined);
    state.auditRun.mockResolvedValue({ meta: { changes: 1 } });
  });

  it("requires an authenticated administrator", async () => {
    state.auth.mockResolvedValue(null);
    expect((await request()).status).toBe(401);
    expect(state.createDownloadExport).not.toHaveBeenCalled();
  });

  it("uses the organization-scoped event and queues only the export id", async () => {
    const response = await request();
    expect(response.status).toBe(202);
    expect(state.findEventById).toHaveBeenCalledWith(eventId, "eventaj");
    expect(state.createDownloadExport).toHaveBeenCalledWith({
      eventId,
      eventName: "Poroka",
      requestedBy: "admin@example.test",
      organizationId: "eventaj",
    });
    expect(state.send).toHaveBeenCalledWith({ exportId });
  });

  it("rejects an empty gallery without queueing work", async () => {
    state.createDownloadExport.mockResolvedValue(null);
    const response = await request();
    expect(response.status).toBe(422);
    expect(state.send).not.toHaveBeenCalled();
  });
});
