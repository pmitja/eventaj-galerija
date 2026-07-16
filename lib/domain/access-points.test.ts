import { describe, expect, it } from "vitest";
import { accessPointTarget, createAccessPointRecord } from "./access-points";

describe("access points", () => {
  it("creates an unpredictable URL-safe public code", () => {
    const point = createAccessPointRecord({ eventId: "event-1", label: " Glavni vhod " });

    expect(point.label).toBe("Glavni vhod");
    expect(point.publicCode).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(point.active).toBe(true);
  });

  it("builds a stable redirect target without retaining base URL path or query", () => {
    expect(accessPointTarget("https://galerija.eventaj.si/old?x=1", "abc_DEF-123"))
      .toBe("https://galerija.eventaj.si/t/abc_DEF-123");
  });
});
