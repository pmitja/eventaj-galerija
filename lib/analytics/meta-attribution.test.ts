import { describe, expect, it } from "vitest";
import { TRACKING_CONSENT_COOKIE, TRACKING_CONSENT_VERSION } from "@/lib/client/tracking-consent";
import { marketingAttributionFromRequest } from "./meta-attribution";

function consentCookie(marketing: boolean): string {
  return `${TRACKING_CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({
    analytics: false,
    marketing,
    version: TRACKING_CONSENT_VERSION,
    updatedAt: "2026-08-13T12:00:00.000Z",
  }))}`;
}

describe("Meta checkout attribution", () => {
  it("captures validated identifiers only on Guest Mosaic with marketing consent", () => {
    const request = new Request("https://guestmosaic.com/api/v1/checkout", { headers: {
      cookie: `${consentCookie(true)}; _fbp=fb.1.1786630000.browser_1; _fbc=fb.1.1786630000.click_1`,
      "cf-connecting-ip": "203.0.113.10",
      "user-agent": "Test browser",
    } });

    expect(marketingAttributionFromRequest(request, "en")).toEqual({
      consent: true,
      consentVersion: TRACKING_CONSENT_VERSION,
      fbp: "fb.1.1786630000.browser_1",
      fbc: "fb.1.1786630000.click_1",
      clientIp: "203.0.113.10",
      clientUserAgent: "Test browser",
    });
  });

  it.each([
    ["https://guestmosaic.com/api/v1/checkout", false, "en" as const],
    ["https://galerija.eventaj.si/api/v1/checkout", true, "sl" as const],
  ])("returns no attribution outside the consented Guest Mosaic flow", (url, marketing, locale) => {
    const request = new Request(url, { headers: { cookie: consentCookie(marketing) } });
    expect(marketingAttributionFromRequest(request, locale)).toBeNull();
  });

  it("drops malformed Meta identifiers instead of persisting them", () => {
    const request = new Request("https://guestmosaic.com/api/v1/checkout", { headers: {
      cookie: `${consentCookie(true)}; _fbp=not-a-meta-id; _fbc=%E0%A4%A`,
      "cf-connecting-ip": "not-an-ip",
    } });
    expect(marketingAttributionFromRequest(request, "en")).toMatchObject({ fbp: null, fbc: null, clientIp: null });
  });
});
