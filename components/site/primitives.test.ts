import { describe, expect, it } from "vitest";
import { plainText, withAccent } from "./primitives";

describe("display heading accents", () => {
  it("keeps explicit markers", () => {
    expect(withAccent("Every photo, *in one gallery.*")).toBe("Every photo, *in one gallery.*");
  });

  it("accents the last sentence of a two-sentence heading", () => {
    expect(withAccent("One complete wedding gallery. €35 once.")).toBe("One complete wedding gallery. *€35 once.*");
  });

  it("accents the last three words of a single sentence", () => {
    expect(withAccent("Collect your guests’ wedding photos with one QR code.")).toBe("Collect your guests’ wedding photos with *one QR code.*");
  });

  it("leaves short headings alone", () => {
    expect(withAccent("Ready in minutes.")).toBe("Ready in minutes.");
  });

  it("strips markers for plain text", () => {
    expect(plainText("Questions, *answered.*")).toBe("Questions, answered.");
  });
});
