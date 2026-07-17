import { describe, expect, it } from "vitest";
import { adminGalleryQuerySchema, mediaQualityOverrideSchema } from "./admin";
import { qualityBackfillQueueMessageSchema, qualityBackfillRequestSchema } from "./quality-backfill";

describe("admin gallery validation", () => {
  it("accepts supported quality filters and trims search text", () => {
    expect(adminGalleryQuerySchema.parse({ quality: "duplicate", status: "analysis_failed", q: "  IMG_42  " }))
      .toEqual({ quality: "duplicate", status: "analysis_failed", q: "IMG_42" });
  });

  it("rejects unknown categories at both query and mutation boundaries", () => {
    expect(adminGalleryQuerySchema.safeParse({ quality: "excellent" }).success).toBe(false);
    expect(mediaQualityOverrideSchema.safeParse({ category: "excellent" }).success).toBe(false);
  });

  it("allows clearing a manual override", () => {
    expect(mediaQualityOverrideSchema.parse({ category: null })).toEqual({ category: null });
  });

  it("defaults backfills to missing analyses and rejects malformed queue messages", () => {
    expect(qualityBackfillRequestSchema.parse({})).toEqual({ mode: "missing" });
    expect(qualityBackfillQueueMessageSchema.safeParse({ type: "media", backfillId: "bad", mediaId: "bad" }).success).toBe(false);
  });
});
