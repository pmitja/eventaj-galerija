import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ find: vi.fn(), sign: vi.fn() }));
vi.mock("@/lib/repositories/deliveries", () => ({ findPublicDeliveryDownload: state.find }));
vi.mock("@/lib/storage/r2", () => ({ createPresignedDownloadUrl: state.sign }));

import { GET } from "./route";

describe("public archive download", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects a valid bearer token to a short-lived signed download", async () => {
    state.find.mockResolvedValue({ objectKey: "exports/event/file.zip", fileName: "event.zip" });
    state.sign.mockResolvedValue("https://r2.example.test/signed");
    const token = "a".repeat(43);
    const response = await GET(new Request(`https://example.test/prenosi/${token}`), { params: Promise.resolve({ token }) });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://r2.example.test/signed");
  });

  it("returns gone for an expired or unknown token", async () => {
    state.find.mockResolvedValue(null);
    const token = "b".repeat(43);
    const response = await GET(new Request(`https://example.test/prenosi/${token}`), { params: Promise.resolve({ token }) });
    expect(response.status).toBe(410);
  });
});
