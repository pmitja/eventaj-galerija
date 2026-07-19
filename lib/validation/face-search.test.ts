import { describe, expect, it } from "vitest";
import { FACE_SEARCH_MAX_FILE_BYTES } from "@/lib/domain/face-search";
import { createFaceSearchSessionSchema } from "./face-search";

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
});
