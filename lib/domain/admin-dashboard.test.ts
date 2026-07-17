import { describe, expect, it } from "vitest";
import { formatRelativeTime, limitRecentActivity, percentage, presentCustomerStatus, presentEventStatus, scaleChart } from "./admin-dashboard";

describe("admin dashboard presentation rules", () => {
  it("maps every persisted event status to a textual status", () => {
    expect(presentEventStatus("draft")).toEqual({ label: "Osnutek", tone: "draft" });
    expect(presentEventStatus("active")).toEqual({ label: "Aktiven", tone: "active" });
    expect(presentEventStatus("ended")).toEqual({ label: "Zaključen", tone: "ended" });
  });

  it("derives the customer status from the linked event status", () => {
    expect(presentCustomerStatus("active")).toEqual({ label: "Aktivna", tone: "active" });
    expect(presentCustomerStatus("ended")).toEqual({ label: "Zaključena", tone: "ended" });
    expect(presentCustomerStatus(null)).toEqual({ label: "Brez dogodka", tone: "ended" });
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

  it("never exposes more than five recent activities", () => {
    expect(limitRecentActivity([1, 2, 3, 4, 5, 6, 7])).toEqual([1, 2, 3, 4, 5]);
  });

  it("calculates safe analytics percentages", () => {
    expect(percentage(95, 100)).toBe(95);
    expect(percentage(1, 3)).toBe(33.3);
    expect(percentage(0, 0)).toBe(0);
  });
});
