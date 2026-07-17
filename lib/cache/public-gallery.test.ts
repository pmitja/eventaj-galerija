import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ revalidateTag: vi.fn() }));

vi.mock("next/cache", () => ({ revalidateTag: state.revalidateTag }));

import { invalidatePublicGallery, publicGalleryCacheTag } from "./public-gallery";

describe("public gallery cache", () => {
  beforeEach(() => vi.clearAllMocks());

  it("immediately expires only the changed event gallery", () => {
    invalidatePublicGallery("event-1");

    expect(publicGalleryCacheTag("event-1")).toBe("public-gallery:event-1");
    expect(state.revalidateTag).toHaveBeenCalledWith("public-gallery:event-1", { expire: 0 });
  });
});
