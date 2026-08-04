import { describe, expect, it } from "vitest";
import { overlaysForNewEvents } from "./live-engagement";

describe("live engagement overlays", () => {
  it("groups accepted photos from one upload session into one notification", () => {
    const overlays = overlaysForNewEvents([
      { id: "1", type: "upload_accepted", guestId: "guest_a", displayName: "Barbara", uploadSessionId: "session", count: 1, createdAt: "2026-07-18T10:00:00Z" },
      { id: "2", type: "upload_accepted", guestId: "guest_a", displayName: "Barbara", uploadSessionId: "session", count: 1, createdAt: "2026-07-18T10:00:01Z" },
    ]);
    expect(overlays).toHaveLength(1);
    expect(overlays[0]).toMatchObject({ kind: "upload", icon: "camera", title: "Barbara • 2 novih fotografij" });
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
