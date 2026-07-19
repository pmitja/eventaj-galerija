import { describe, expect, it } from "vitest";
import { cleanCommentBody, galleryLikesStorageKey, toggleMediaLike } from "./media-comments";

describe("gallery likes and comments", () => {
  it("scopes local likes to one event and toggles stable media identifiers", () => {
    expect(galleryLikesStorageKey("ana-in-marko")).toBe("eventaj:likes:v1:ana-in-marko");
    expect(toggleMediaLike([], "media-1")).toEqual(["media-1"]);
    expect(toggleMediaLike(["media-1", "media-2"], "media-1")).toEqual(["media-2"]);
  });

  it("keeps intentional paragraphs but removes excessive blank lines", () => {
    expect(cleanCommentBody("  Lep trenutek!\n\n\n\nHvala.  ")).toBe("Lep trenutek!\n\nHvala.");
  });
});
