import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, prepareUploadSchema } from "./uploads";

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
