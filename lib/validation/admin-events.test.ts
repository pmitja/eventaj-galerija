import { describe, expect, it } from "vitest";
import { adminEventsQuerySchema } from "./admin";

describe("admin event query validation", () => {
  it("defaults to all events ordered by descending date", () => {
    expect(adminEventsQuerySchema.parse({})).toEqual({ status: "all", period: "all", sort: "date_desc" });
  });
  it("normalizes blank searches", () => {
    expect(adminEventsQuerySchema.parse({ q: "   " }).q).toBeUndefined();
  });
  it.each([{ status: "unknown" }, { period: "yesterday" }, { sort: "random" }, { q: "a".repeat(101) }, { status: ["active", "ended"] }])("rejects invalid input %j", (query) => {
    expect(adminEventsQuerySchema.safeParse(query).success).toBe(false);
  });
});
