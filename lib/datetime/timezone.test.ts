import { describe, expect, it } from "vitest";
import { isSupportedTimeZone, zonedLocalDateTimeToIso } from "./timezone";

describe("event time zones", () => {
  it("converts winter and summer wall-clock times with the correct offset", () => {
    expect(zonedLocalDateTimeToIso("2026-01-10", "16:00", "Europe/Ljubljana"))
      .toBe("2026-01-10T15:00:00.000Z");
    expect(zonedLocalDateTimeToIso("2026-08-10", "16:00", "Europe/Ljubljana"))
      .toBe("2026-08-10T14:00:00.000Z");
    expect(zonedLocalDateTimeToIso("2026-08-10", "16:00", "America/New_York"))
      .toBe("2026-08-10T20:00:00.000Z");
  });

  it("rejects invalid zones and local times skipped by daylight saving", () => {
    expect(isSupportedTimeZone("Europe/Nowhere")).toBe(false);
    expect(zonedLocalDateTimeToIso("2026-03-29", "02:30", "Europe/Ljubljana")).toBeNull();
  });
});
