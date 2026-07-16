import { describe, expect, it, vi } from "vitest";
import { shareGallery } from "./share-gallery";

const data = {
  title: "Ana & Marko",
  text: "Oglej si fotografije dogodka Ana & Marko.",
  url: "https://galerija.eventaj.si/e/ana-in-marko",
};

describe("shareGallery", () => {
  it("uses the native share sheet when available", async () => {
    const share = vi.fn(async () => undefined);
    const writeText = vi.fn(async () => undefined);

    await expect(shareGallery({ client: { share, clipboard: { writeText } }, data })).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith(data);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("does not copy the link when the user cancels native sharing", async () => {
    const share = vi.fn(async () => { throw new DOMException("Cancelled", "AbortError"); });
    const writeText = vi.fn(async () => undefined);

    await expect(shareGallery({ client: { share, clipboard: { writeText } }, data })).resolves.toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies the URL when native sharing is unavailable", async () => {
    const writeText = vi.fn(async () => undefined);

    await expect(shareGallery({ client: { clipboard: { writeText } }, data })).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith(data.url);
  });

  it("uses the legacy copy fallback when clipboard access fails", async () => {
    const legacyCopy = vi.fn(() => true);

    await expect(shareGallery({
      client: { clipboard: { writeText: async () => { throw new Error("Denied"); } } },
      data,
      legacyCopy,
    })).resolves.toBe("copied");
    expect(legacyCopy).toHaveBeenCalledWith(data.url);
  });

  it("returns an error when no sharing method succeeds", async () => {
    await expect(shareGallery({ client: {}, data, legacyCopy: () => false })).resolves.toBe("error");
  });
});
