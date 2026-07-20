import { describe, expect, it } from "vitest";
import {
  faceCollectionId,
  faceEmbeddingExpiresAt,
  faceSearchExpiresAt,
  faceSearchResultStorageKey,
  isFaceSearchLocalResultCurrent,
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

  it("scopes locally cached match ids to one guest and expires them after 30 days", () => {
    expect(faceSearchResultStorageKey("poroka", "guest_123"))
      .toBe("eventaj:face-matches:v1:poroka:guest_123");
    expect(isFaceSearchLocalResultCurrent(
      "2026-07-01T00:00:00.000Z",
      "privacy-v1",
      "privacy-v1",
      new Date("2026-07-20T00:00:00.000Z"),
    )).toBe(true);
    expect(isFaceSearchLocalResultCurrent(
      "2026-06-01T00:00:00.000Z",
      "privacy-v1",
      "privacy-v1",
      new Date("2026-07-20T00:00:00.000Z"),
    )).toBe(false);
    expect(isFaceSearchLocalResultCurrent(
      "2026-07-19T00:00:00.000Z",
      "privacy-v1",
      "privacy-v2",
      new Date("2026-07-20T00:00:00.000Z"),
    )).toBe(false);
  });
});
