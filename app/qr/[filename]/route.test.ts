import { describe, expect, it, vi } from "vitest";

const publicCode = "AbCdEfGhIjKlMnOpQrStUv";

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => ({ PUBLIC_APP_URL: "https://galerija.eventaj.si" }),
}));

vi.mock("@/lib/repositories/access-points", () => ({
  findActiveAccessPoint: vi.fn(async (code: string) => code === publicCode ? {
    id: "access-1",
    event_id: "event-1",
    public_code: publicCode,
    active: 1,
  } : null),
}));

import { GET } from "./route";

describe("QR delivery route", () => {
  it("renders a downloadable SVG for an active access point", async () => {
    const response = await GET(
      new Request(`https://example.test/qr/${publicCode}.svg?download=1`),
      { params: Promise.resolve({ filename: `${publicCode}.svg` }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(response.headers.get("content-disposition")).toContain(`${publicCode}.svg`);
    expect(await response.text()).toContain("<svg");
  });

  it("renders a valid PNG signature", async () => {
    const response = await GET(
      new Request(`https://example.test/qr/${publicCode}.png`),
      { params: Promise.resolve({ filename: `${publicCode}.png` }) },
    );
    const bytes = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect([...bytes.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it("does not generate QR codes for unknown public codes", async () => {
    const unknown = "ZyXwVuTsRqPoNmLkJiHgFe";
    const response = await GET(
      new Request(`https://example.test/qr/${unknown}.svg`),
      { params: Promise.resolve({ filename: `${unknown}.svg` }) },
    );

    expect(response.status).toBe(404);
  });
});
