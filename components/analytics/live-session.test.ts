import { describe, expect, it } from "vitest";
import { isLiveSessionHostname } from "./live-session";

describe("isLiveSessionHostname", () => {
  it("enables tracking only on the canonical Guest Mosaic domain", () => {
    expect(isLiveSessionHostname("guestmosaic.com")).toBe(true);
    expect(isLiveSessionHostname("galerija.eventaj.si")).toBe(false);
    expect(isLiveSessionHostname("www.galerija.eventaj.si")).toBe(false);
    expect(isLiveSessionHostname("www.guestmosaic.com")).toBe(false);
    expect(isLiveSessionHostname("localhost")).toBe(false);
  });
});
