import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  auth: vi.fn(),
  findOwnedDownloadExport: vi.fn(),
  createPresignedDownloadUrl: vi.fn(),
}));

const exportId = "0a3fdaaa-684e-44a0-aa34-d6cdf3317699";

vi.mock("@/auth", () => ({ auth: state.auth }));
vi.mock("@/lib/repositories/exports", () => ({ findOwnedDownloadExport: state.findOwnedDownloadExport }));
vi.mock("@/lib/storage/r2", () => ({ createPresignedDownloadUrl: state.createPresignedDownloadUrl }));

import { GET } from "./route";

function request() {
  return GET(new Request(`https://gallery.example.test/api/v1/admin/exports/${exportId}`), {
    params: Promise.resolve({ exportId }),
  });
}

describe("admin export status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.auth.mockResolvedValue({ user: { email: "admin@example.test" } });
    state.findOwnedDownloadExport.mockResolvedValue({
      id: exportId,
      status: "ready",
      object_key: `exports/event-1/${exportId}.zip`,
      file_name: "Poroka.zip",
      media_count: 3,
      size_bytes: 1234,
      expires_at: "2999-07-17T12:00:00Z",
    });
    state.createPresignedDownloadUrl.mockResolvedValue("https://signed.example.test/export.zip");
  });

  it("does not disclose exports without authentication", async () => {
    state.auth.mockResolvedValue(null);
    expect((await request()).status).toBe(401);
    expect(state.findOwnedDownloadExport).not.toHaveBeenCalled();
  });

  it("signs a private object only for a ready owned export", async () => {
    const response = await request();
    expect(response.status).toBe(200);
    expect(state.findOwnedDownloadExport).toHaveBeenCalledWith(exportId, "eventaj");
    expect(state.createPresignedDownloadUrl).toHaveBeenCalledWith(`exports/event-1/${exportId}.zip`);
    const body = await response.json() as { export: { downloadUrl: string | null } };
    expect(body.export.downloadUrl).toBe("https://signed.example.test/export.zip");
  });

  it("does not sign an expired archive", async () => {
    state.findOwnedDownloadExport.mockResolvedValue({
      id: exportId,
      status: "ready",
      object_key: "exports/event-1/export-1.zip",
      file_name: "Poroka.zip",
      media_count: 3,
      size_bytes: 1234,
      expires_at: "2020-01-01T00:00:00Z",
    });
    const response = await request();
    const body = await response.json() as { export: { status: string } };
    expect(body.export.status).toBe("expired");
    expect(state.createPresignedDownloadUrl).not.toHaveBeenCalled();
  });
});
