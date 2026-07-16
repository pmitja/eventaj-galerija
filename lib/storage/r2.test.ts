import { beforeEach, describe, expect, it, vi } from "vitest";

const cloudflareEnv = vi.hoisted(() => ({
  R2_ACCOUNT_ID: "0123456789abcdef0123456789abcdef",
  R2_ACCESS_KEY_ID: "test-access-key",
  R2_SECRET_ACCESS_KEY: "test-secret-key",
  R2_BUCKET_NAME: "eventaj-test-media",
}));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => cloudflareEnv,
}));

import { createPresignedUploadUrl, PRESIGNED_UPLOAD_TTL_SECONDS } from "./r2";

describe("createPresignedUploadUrl", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("signs one private object PUT for ten minutes and binds the content type", async () => {
    const signedUrl = new URL(await createPresignedUploadUrl(
      "originals/event id/media-id/original",
      "image/jpeg",
    ));

    expect(signedUrl.origin).toBe(
      "https://0123456789abcdef0123456789abcdef.eu.r2.cloudflarestorage.com",
    );
    expect(signedUrl.pathname).toBe("/eventaj-test-media/originals/event%20id/media-id/original");
    expect(signedUrl.searchParams.get("X-Amz-Expires")).toBe(String(PRESIGNED_UPLOAD_TTL_SECONDS));
    expect(signedUrl.searchParams.get("X-Amz-SignedHeaders")).toBe("content-type;host");
    expect(signedUrl.searchParams.get("X-Amz-Signature")).toMatch(/^[a-f0-9]{64}$/);
  });
});
