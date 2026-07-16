import { describe, expect, it } from "vitest";
import { formatRelativeTime, presentEventStatus, scaleChart } from "./admin-dashboard";

describe("admin dashboard presentation rules", () => {
  it("maps every persisted event status to a textual status", () => {
    expect(presentEventStatus("draft")).toEqual({ label: "Osnutek", tone: "draft" });
    expect(presentEventStatus("active")).toEqual({ label: "Aktiven", tone: "active" });
    expect(presentEventStatus("ended")).toEqual({ label: "Zaključen", tone: "ended" });
  });

  it("scales visit counts without inventing activity for an empty period", () => {
    expect(scaleChart([0, 0])).toEqual([0, 0]);
    expect(scaleChart([0, 5, 10])).toEqual([0, 50, 100]);
  });

  it("formats recent activity relative to the supplied clock", () => {
    const now = new Date("2026-07-16T10:00:00.000Z");
    expect(formatRelativeTime("2026-07-16T09:48:00.000Z", now)).toBe("pred 12 min");
    expect(formatRelativeTime("2026-07-14T09:00:00.000Z", now)).toBe("pred 2 d");
  });
});
