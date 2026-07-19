import { describe, expect, it } from "vitest";
import {
  faceCollectionId,
  faceEmbeddingExpiresAt,
  faceSearchExpiresAt,
  isTerminalFaceSearchStatus,
  packageIncludesFaceCollections,
} from "./face-search";

describe("face search business rules", () => {
  it("enables face collections only for the premium package snapshot", () => {
    expect(packageIncludesFaceCollections("premium")).toBe(true);
    expect(packageIncludesFaceCollections("advanced")).toBe(false);
    expect(packageIncludesFaceCollections("basic")).toBe(false);
  });

  it("keeps a selfie session ephemeral", () => {
    expect(faceSearchExpiresAt(new Date("2026-07-19T10:00:00.000Z")))
      .toBe("2026-07-19T10:15:00.000Z");
  });

  it("never retains provider face references beyond event retention", () => {
    expect(faceEmbeddingExpiresAt("2026-07-25T00:00:00.000Z", new Date("2026-07-19T00:00:00.000Z")))
      .toBe("2026-07-25T00:00:00.000Z");
  });

  it("recognizes terminal states and creates provider-safe collection ids", () => {
    expect(isTerminalFaceSearchStatus("completed")).toBe(true);
    expect(isTerminalFaceSearchStatus("searching")).toBe(false);
    expect(faceCollectionId("event/id with spaces")).toBe("eventaj-event-id-with-spaces");
  });
});
