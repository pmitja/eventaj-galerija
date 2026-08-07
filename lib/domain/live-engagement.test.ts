import { describe, expect, it } from "vitest";
import { overlaysForNewEvents } from "./live-engagement";
import type { Locale } from "@/lib/i18n/locale";

describe("live engagement overlays", () => {
  it("groups accepted photos from one upload session into one notification", () => {
    const overlays = overlaysForNewEvents([
      { id: "1", type: "upload_accepted", guestId: "guest_a", displayName: "Barbara", uploadSessionId: "session", count: 1, createdAt: "2026-07-18T10:00:00Z" },
      { id: "2", type: "upload_accepted", guestId: "guest_a", displayName: "Barbara", uploadSessionId: "session", count: 1, createdAt: "2026-07-18T10:00:01Z" },
    ]);
    expect(overlays).toHaveLength(1);
    // Slovenian dual: two photos is "2 novi fotografiji", not the plural "novih fotografij".
    expect(overlays[0]).toMatchObject({ kind: "upload", icon: "camera", title: "Barbara • 2 novi fotografiji" });
  });

  it("picks the right Slovenian plural form for each count", () => {
    function titleFor(count: number) {
      const overlay = overlaysForNewEvents([
        { id: "1", type: "upload_accepted", guestId: "guest_a", displayName: "Barbara", uploadSessionId: "session", count, createdAt: "2026-07-18T10:00:00Z" },
      ])[0];
      return overlay && "title" in overlay ? overlay.title : undefined;
    }

    expect(titleFor(1)).toBe("Barbara • 1 nova fotografija");
    expect(titleFor(2)).toBe("Barbara • 2 novi fotografiji");
    expect(titleFor(3)).toBe("Barbara • 3 nove fotografije");
    expect(titleFor(5)).toBe("Barbara • 5 novih fotografij");
  });

  it("translates overlays for the additional marketing languages", () => {
    const events = [
      { id: "1", type: "upload_accepted" as const, guestId: "guest_a", displayName: "Barbara", uploadSessionId: "session", count: 2, createdAt: "2026-07-18T10:00:00Z" },
    ];

    function overlayFor(locale: Locale) {
      const overlay = overlaysForNewEvents(events, locale)[0];
      if (!overlay || !("title" in overlay)) throw new Error("expected a titled overlay");
      return overlay;
    }

    expect(overlayFor("de").title).toBe("Barbara • 2 neue Fotos");
    expect(overlayFor("fr").title).toBe("Barbara • 2 nouvelles photos");
    expect(overlayFor("de").detail).toBe("Gerade ins Album aufgenommen.");
  });

  it("does not create named overlays for anonymous contributions", () => {
    expect(overlaysForNewEvents([
      { id: "1", type: "upload_accepted", guestId: "guest_a", displayName: null, uploadSessionId: "session", count: 1, createdAt: "2026-07-18T10:00:00Z" },
    ])).toEqual([]);
  });

  it("uses distinct artwork for first place and global community milestones", () => {
    const overlays = overlaysForNewEvents([
      { id: "1", type: "leader_changed", guestId: "guest_a", displayName: "Nina", uploadSessionId: null, count: 51, createdAt: "2026-07-18T10:00:00Z" },
      { id: "2", type: "contributor_total_milestone", guestId: null, displayName: null, uploadSessionId: null, count: 50, createdAt: "2026-07-18T10:00:01Z" },
    ]);

    expect(overlays).toEqual(expect.arrayContaining([
      expect.objectContaining({ icon: "first-place" }),
      expect.objectContaining({ icon: "community" }),
    ]));
  });

  it("renders English overlays for the English domain", () => {
    const overlays = overlaysForNewEvents([
      { id: "1", type: "upload_accepted", guestId: "guest_a", displayName: "Nina", uploadSessionId: "session", count: 2, createdAt: "2026-07-18T10:00:00Z" },
    ], "en");
    expect(overlays[0]).toMatchObject({ title: "Nina • 2 new photos", detail: "Just added to the album." });
  });
});
