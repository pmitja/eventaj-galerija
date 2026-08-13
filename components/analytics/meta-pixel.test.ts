import { describe, expect, it } from "vitest";
import { isMetaPixelHostname } from "./meta-pixel";

describe("isMetaPixelHostname", () => {
  it("enables Meta tracking only on the canonical Guest Mosaic domain", () => {
    expect(isMetaPixelHostname("guestmosaic.com")).toBe(true);
    expect(isMetaPixelHostname("www.guestmosaic.com")).toBe(false);
    expect(isMetaPixelHostname("galerija.eventaj.si")).toBe(false);
    expect(isMetaPixelHostname("localhost")).toBe(false);
  });
});
