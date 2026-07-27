import { describe, expect, it } from "vitest";
import { createEventRecord, isEventDurationAllowed, retentionDate } from "./events";

describe("event duration", () => {
  it("allows an event lasting exactly seven days", () => {
    expect(isEventDurationAllowed("2026-08-01T14:00:00.000Z", "2026-08-08T14:00:00.000Z")).toBe(true);
  });

  it("rejects an event lasting longer than seven days", () => {
    expect(isEventDurationAllowed("2026-08-01T14:00:00.000Z", "2026-08-08T14:00:00.001Z")).toBe(false);
  });
});

describe("event retention", () => {
  it("expires exactly 90 days after event end", () => {
    expect(retentionDate("2026-07-18T22:00:00.000Z")).toBe("2026-10-16T22:00:00.000Z");
  });

  it("creates an active event with an unpredictable public slug", () => {
    const event = createEventRecord({
      name: "Ana in Marko",
      location: "Ljubljana",
      startsAt: "2026-07-18T14:00:00.000Z",
      endsAt: "2026-07-18T22:00:00.000Z",
      timezone: "Europe/Ljubljana",
      customerName: "Ana Kovač",
      customerEmail: "ana@example.com",
      packageCode: "advanced",
      commentsEnabled: true,
    });
    expect(event.status).toBe("active");
    expect(event.publicSlug).toMatch(/^[a-f0-9]{32}$/);
    expect(event.retentionUntil).toBe("2026-10-16T22:00:00.000Z");
  });
});
