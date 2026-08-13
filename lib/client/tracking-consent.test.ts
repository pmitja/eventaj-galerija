import { describe, expect, it } from "vitest";
import {
  TRACKING_CONSENT_VERSION,
  isGuestMosaicConsentHostname,
  isGuestMosaicTrackingHostname,
  isOptionalTrackingPathname,
  parseTrackingConsent,
} from "./tracking-consent";

describe("tracking consent", () => {
  it("accepts only the current complete consent record", () => {
    expect(parseTrackingConsent(JSON.stringify({
      analytics: true,
      marketing: false,
      updatedAt: "2026-08-13T14:00:00.000Z",
      version: TRACKING_CONSENT_VERSION,
    }))).toMatchObject({ analytics: true, marketing: false });

    expect(parseTrackingConsent("not-json")).toBeNull();
    expect(parseTrackingConsent(JSON.stringify({
      analytics: true,
      marketing: true,
      updatedAt: "2026-08-13T14:00:00.000Z",
      version: "2026-07-31",
    }))).toBeNull();
  });

  it("limits optional tracking to the canonical Guest Mosaic hostname", () => {
    expect(isGuestMosaicTrackingHostname("guestmosaic.com")).toBe(true);
    expect(isGuestMosaicTrackingHostname("www.guestmosaic.com")).toBe(false);
    expect(isGuestMosaicTrackingHostname("galerija.eventaj.si")).toBe(false);
    expect(isGuestMosaicTrackingHostname("localhost")).toBe(false);
  });

  it("allows the consent UI on the local English development hostname", () => {
    expect(isGuestMosaicConsentHostname("guestmosaic.com")).toBe(true);
    expect(isGuestMosaicConsentHostname("en.localhost")).toBe(true);
    expect(isGuestMosaicConsentHostname("localhost")).toBe(false);
  });

  it("keeps optional tracking out of private and operational routes", () => {
    expect(isOptionalTrackingPathname("/")).toBe(true);
    expect(isOptionalTrackingPathname("/de/order")).toBe(false);
    expect(isOptionalTrackingPathname("/privacy")).toBe(true);
    expect(isOptionalTrackingPathname("/e/private-event")).toBe(false);
    expect(isOptionalTrackingPathname("/de/e/private-event")).toBe(false);
    expect(isOptionalTrackingPathname("/display/token")).toBe(false);
    expect(isOptionalTrackingPathname("/admin/events")).toBe(false);
    expect(isOptionalTrackingPathname("/downloads/token")).toBe(false);
    expect(isOptionalTrackingPathname("/nakup/uspesen")).toBe(false);
    expect(isOptionalTrackingPathname("/naroci")).toBe(false);
    expect(isOptionalTrackingPathname("/order")).toBe(false);
    expect(isOptionalTrackingPathname("/order/success")).toBe(false);
  });
});
