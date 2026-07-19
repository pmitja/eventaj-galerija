import { describe, expect, it } from "vitest";
import { cleanDisplayName, displayNameSuggestions, normalizeDisplayName, reachedMilestones } from "./guest-identity";

describe("anonymous guest identity rules", () => {
  it("normalizes casing and whitespace for event-level duplicate detection", () => {
    expect(cleanDisplayName("  Barbara   K. ")).toBe("Barbara K.");
    expect(normalizeDisplayName(" BARBARA  ")).toBe(normalizeDisplayName("barbara"));
  });

  it("offers editable non-numeric alternatives", () => {
    const suggestions = displayNameSuggestions("Barbara");
    expect(suggestions).toContain("Barbara K.");
    expect(suggestions).toContain("Barbara P.");
    expect(suggestions.every((suggestion) => !/#?\d/.test(suggestion))).toBe(true);
  });

  it("returns every newly reachable threshold for batched uploads", () => {
    expect(reachedMilestones(51, [25, 50, 100])).toEqual([25, 50]);
  });
});
