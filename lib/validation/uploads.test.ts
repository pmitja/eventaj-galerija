import { describe, expect, it } from "vitest";
import { VIDEO_MAX_BYTES } from "@/lib/domain/billing";
import { CURRENT_UPLOAD_CONSENT_VERSION } from "@/lib/domain/legal";
import { MAX_IMAGE_BYTES, prepareUploadSchema, prepareVideoUploadSchema } from "./uploads";

describe("prepareUploadSchema", () => {
  it("accepts a supported image within the limit", () => {
    expect(prepareUploadSchema.safeParse({
      filename: "foto.jpg",
      mime: "image/jpeg",
      sizeBytes: MAX_IMAGE_BYTES,
      publicationConsent: true,
    }).success).toBe(true);
  });

  it("rejects active and oversized files", () => {
    expect(prepareUploadSchema.safeParse({
      filename: "payload.svg",
      mime: "image/svg+xml",
      sizeBytes: MAX_IMAGE_BYTES + 1,
      publicationConsent: true,
    }).success).toBe(false);
  });
});

describe("prepareVideoUploadSchema", () => {
  const valid = {
    filename: "utrinek.mp4",
    mime: "video/mp4",
    sizeBytes: VIDEO_MAX_BYTES,
    publicationConsent: true,
    termsAccepted: true,
    consentVersion: CURRENT_UPLOAD_CONSENT_VERSION,
  } as const;

  it("accepts a supported video with the current explicit consent", () => {
    expect(prepareVideoUploadSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects oversized videos, unsupported formats and missing consent", () => {
    expect(prepareVideoUploadSchema.safeParse({ ...valid, sizeBytes: VIDEO_MAX_BYTES + 1 }).success).toBe(false);
    expect(prepareVideoUploadSchema.safeParse({ ...valid, mime: "video/x-msvideo" }).success).toBe(false);
    expect(prepareVideoUploadSchema.safeParse({ ...valid, termsAccepted: false }).success).toBe(false);
  });
});
