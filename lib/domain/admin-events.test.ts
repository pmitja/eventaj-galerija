import { describe, expect, it } from "vitest";
import { adminEventsQuerySchema } from "@/lib/validation/admin";
import { filterAdminEvents } from "./admin-events";

const events = [
  { name: "Žur", location: "Bled", status: "draft" as const, starts_at: "2026-09-30T22:30:00Z", timezone: "Europe/Ljubljana", is_upcoming: 1 },
  { name: "Ana", location: "Ljubljana", status: "active" as const, starts_at: "2026-09-01T10:00:00Z", timezone: "Europe/Ljubljana", is_upcoming: 1 },
  { name: "Čaj", location: null, status: "ended" as const, starts_at: "2026-08-31T10:00:00Z", timezone: "Europe/Ljubljana", is_upcoming: 0 },
];
const now = new Date("2026-09-11T12:00:00Z");
const names = (query: Record<string, string>) => filterAdminEvents(events, adminEventsQuerySchema.parse(query), now).map((event) => event.name);

describe("admin event filtering and sorting", () => {
  it.each([
    ["active", ["Ana"]], ["draft", ["Žur"]], ["ended", ["Čaj"]], ["upcoming", ["Žur", "Ana"]],
  ])("filters status %s", (status, expected) => {
    expect(names({ status })).toEqual(expected);
  });

  it("combines status, trimmed case-insensitive name/location search and period", () => {
    expect(names({ q: "  LJUBLJANA  ", status: "active", period: "this_month" })).toEqual(["Ana"]);
    expect(names({ q: "ČAJ" })).toEqual(["Čaj"]);
    expect(names({ q: "Bled", status: "ended" })).toEqual([]);
  });

  it.each([
    ["date_desc", ["Žur", "Ana", "Čaj"]], ["date_asc", ["Čaj", "Ana", "Žur"]],
    ["name_asc", ["Ana", "Čaj", "Žur"]], ["name_desc", ["Žur", "Čaj", "Ana"]],
  ])("sorts by %s without mutating the source", (sort, expected) => {
    expect(names({ sort })).toEqual(expected);
    expect(events.map((event) => event.name)).toEqual(["Žur", "Ana", "Čaj"]);
  });

  it("uses the event timezone at month boundaries", () => {
    expect(names({ period: "this_month" })).toEqual(["Ana"]);
    expect(names({ period: "previous_month" })).toEqual(["Čaj"]);
    const atBoundary = new Date("2026-09-30T22:45:00Z");
    expect(filterAdminEvents(events, adminEventsQuerySchema.parse({ period: "this_month" }), atBoundary).map((event) => event.name)).toEqual(["Žur"]);
  });

  it("handles the previous month across a year boundary", () => {
    const decemberEvent = { ...events[0], starts_at: "2026-12-31T20:00:00Z" };
    expect(filterAdminEvents([decemberEvent], adminEventsQuerySchema.parse({ period: "previous_month" }), new Date("2027-01-05T12:00:00Z"))).toEqual([decemberEvent]);
  });

  it("handles an empty list", () => {
    expect(filterAdminEvents([], adminEventsQuerySchema.parse({}), now)).toEqual([]);
  });
});
