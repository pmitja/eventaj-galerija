import { describe, expect, it } from "vitest";
import { exportExpiry, exportFileName, uniqueWebpEntryNames } from "./exports";

describe("download exports", () => {
  it("creates a safe deterministic archive name", () => {
    expect(exportFileName("Poroka Ane & Marka", new Date("2026-07-16T12:00:00Z")))
      .toBe("Poroka-Ane-Marka-20260716.zip");
  });

  it("expires an archive after 24 hours", () => {
    expect(exportExpiry(new Date("2026-07-16T12:00:00Z"))).toBe("2026-07-17T12:00:00.000Z");
  });

  it("removes paths and deduplicates archive entry names", () => {
    expect(uniqueWebpEntryNames(["../IMG 1.jpg", "folder/IMG 1.png", "\\evil\\..\\.jpg"]))
      .toEqual(["IMG-1.webp", "IMG-1-2.webp", "fotografija.webp"]);
  });
});
