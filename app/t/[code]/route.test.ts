import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  publicCode: "AbCdEfGhIjKlMnOpQrStUv",
  waitUntil: vi.fn(),
  recordVisit: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({ ctx: { waitUntil: state.waitUntil } }),
}));

vi.mock("@/lib/repositories/access-points", () => ({
  findActiveAccessPoint: vi.fn(async (code: string) => code === state.publicCode ? {
    id: "access-1",
    event_id: "event-1",
    public_code: state.publicCode,
    event_slug: "event-slug",
  } : null),
  recordAccessPointVisit: state.recordVisit,
}));

import { GET } from "./route";

describe("stable access-point redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.recordVisit.mockResolvedValue(undefined);
  });

  it("redirects to the current event and retains access-point attribution", async () => {
    const response = await GET(
      new Request(`https://galerija.eventaj.si/t/${state.publicCode}`, {
        headers: { referer: "https://example.com/invitation" },
      }),
      { params: Promise.resolve({ code: state.publicCode }) },
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://galerija.eventaj.si/e/event-slug");
    expect(response.headers.get("set-cookie")).toContain(`eventaj_access_point=${state.publicCode}`);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(state.recordVisit).toHaveBeenCalledWith(expect.objectContaining({ id: "access-1" }), "example.com");
    expect(state.waitUntil).toHaveBeenCalledOnce();
  });

  it("returns 404 for invalid codes", async () => {
    const response = await GET(
      new Request("https://galerija.eventaj.si/t/short"),
      { params: Promise.resolve({ code: "short" }) },
    );

    expect(response.status).toBe(404);
    expect(state.waitUntil).not.toHaveBeenCalled();
  });
});
