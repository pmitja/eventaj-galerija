import { describe, expect, it } from "vitest";
import { FACE_SEARCH_MAX_FILE_BYTES } from "@/lib/domain/face-search";
import { createFaceSearchSessionSchema, faceQueueMessageSchema, storedFaceSearchResultSchema } from "./face-search";

const valid = {
  guestId: "guest_0123456789abcdef",
  filename: "selfie.jpg",
  mime: "image/jpeg",
  sizeBytes: 250_000,
  consent: true,
  policyVersion: "2026-07-19",
} as const;

describe("face search validation", () => {
  it("accepts a consented JPEG selfie", () => {
    expect(createFaceSearchSessionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing consent and oversized or unsupported files", () => {
    expect(createFaceSearchSessionSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(createFaceSearchSessionSchema.safeParse({ ...valid, sizeBytes: FACE_SEARCH_MAX_FILE_BYTES + 1 }).success).toBe(false);
    expect(createFaceSearchSessionSchema.safeParse({ ...valid, mime: "image/webp" }).success).toBe(false);
  });

  it("accepts UUID and legacy SQLite face index job identifiers", () => {
    const message = {
      kind: "index",
      mediaId: "59b8a5fe-b13a-437c-ab38-2d00f45f3455",
      organizationId: "eventaj",
    } as const;

    expect(faceQueueMessageSchema.safeParse({
      ...message,
      jobId: "31ed77a8-71d3-4ea4-9c25-201e1a78cd6d",
    }).success).toBe(true);
    expect(faceQueueMessageSchema.safeParse({
      ...message,
      jobId: "cf40dd8b96582ca5643b2ebc266dc01d",
    }).success).toBe(true);
    expect(faceQueueMessageSchema.safeParse({ ...message, jobId: "not-a-job-id" }).success).toBe(false);
  });

  it("accepts only a small versioned local cache of public media ids", () => {
    expect(storedFaceSearchResultSchema.safeParse({
      version: 1,
      policyVersion: "2026-07-19",
      createdAt: "2026-07-20T08:00:00.000Z",
      mediaIds: ["public-photo-1", "public-photo-2"],
    }).success).toBe(true);
    expect(storedFaceSearchResultSchema.safeParse({
      version: 2,
      policyVersion: "2026-07-19",
      createdAt: "not-a-date",
      mediaIds: ["public-photo-1"],
    }).success).toBe(false);
  });
});
