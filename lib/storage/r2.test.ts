import { beforeEach, describe, expect, it, vi } from "vitest";

const cloudflareEnv = vi.hoisted(() => ({
  R2_ACCOUNT_ID: "0123456789abcdef0123456789abcdef",
  R2_ACCESS_KEY_ID: "test-access-key",
  R2_SECRET_ACCESS_KEY: "test-secret-key",
  R2_BUCKET_NAME: "eventaj-test-media",
  DB: { prepare: vi.fn() },
  MEDIA: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  IMAGES: { input: vi.fn(), info: vi.fn() },
}));
const qualityRepository = vi.hoisted(() => ({
  findEarlierDuplicate: vi.fn(),
  reconcileLaterDuplicates: vi.fn(),
  saveTechnicalAnalysis: vi.fn(),
  saveTechnicalAnalysisFailure: vi.fn(),
}));

vi.mock("@/lib/cloudflare", () => ({
  getCloudflareEnv: () => cloudflareEnv,
}));
vi.mock("@/lib/repositories/media-quality", () => qualityRepository);

import { EXPORT_DOWNLOAD_TTL_SECONDS } from "@/lib/domain/exports";
import { createPresignedDownloadUrl, createPresignedUploadUrl, PRESIGNED_UPLOAD_TTL_SECONDS, processImage, processTechnicalAnalysis } from "./r2";

describe("createPresignedUploadUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("signs a private export GET for ten minutes", async () => {
    const signedUrl = new URL(await createPresignedDownloadUrl("exports/event-1/export-1.zip"));
    expect(signedUrl.pathname).toBe("/eventaj-test-media/exports/event-1/export-1.zip");
    expect(signedUrl.searchParams.get("X-Amz-Expires")).toBe(String(EXPORT_DOWNLOAD_TTL_SECONDS));
    expect(signedUrl.searchParams.get("X-Amz-SignedHeaders")).toBe("host");
    expect(signedUrl.searchParams.get("X-Amz-Signature")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("creates variants and quality analysis after the image becomes ready", async () => {
    const first = vi.fn().mockResolvedValue({
      id: "media-1",
      event_id: "event-1",
      object_key: "originals/event-1/media-1/original",
      size_bytes: 8,
      declared_mime: "image/jpeg",
      created_at: "2026-07-16T10:00:00.000Z",
      status: "processing",
    });
    const run = vi.fn().mockResolvedValue({ meta: { changes: 1 } });
    cloudflareEnv.DB.prepare.mockImplementation(() => ({
      bind: vi.fn(() => ({ first, run })),
    }));
    cloudflareEnv.MEDIA.get.mockImplementation(() => Promise.resolve({
      body: new Blob(["original"]).stream(),
      size: 8,
    }));
    cloudflareEnv.MEDIA.put.mockResolvedValue(undefined);
    cloudflareEnv.IMAGES.info.mockImplementation(async (stream: ReadableStream<Uint8Array>) => {
      await new Response(stream).arrayBuffer();
      return { format: "image/jpeg", fileSize: 8, width: 1600, height: 1200 };
    });
    cloudflareEnv.IMAGES.input.mockImplementation(() => ({
      transform: () => ({
        output: async ({ format }: { format: string }) => ({
          response: () => format === "rgba"
            ? new Response(new Uint8Array(256 * 256 * 4).fill(128))
            : new Response("derived"),
        }),
      }),
    }));
    qualityRepository.findEarlierDuplicate.mockResolvedValue(null);
    qualityRepository.saveTechnicalAnalysis.mockResolvedValue(undefined);
    qualityRepository.reconcileLaterDuplicates.mockResolvedValue(undefined);

    await expect(processImage("media-1", "eventaj")).resolves.toBe("ready");

    expect(cloudflareEnv.MEDIA.put).toHaveBeenCalledTimes(2);
    expect(qualityRepository.saveTechnicalAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "eventaj",
        eventId: "event-1",
        mediaId: "media-1",
        checksumSha256: expect.stringMatching(/^[a-f\d]{64}$/),
        width: 1600,
        height: 1200,
        category: "blurry",
      }),
      cloudflareEnv.DB,
    );
    expect(qualityRepository.reconcileLaterDuplicates).toHaveBeenCalledWith(
      expect.objectContaining({ canonicalMediaId: "media-1", mediaId: "media-1" }),
      cloudflareEnv.DB,
    );
  });

  it("records a retry failure without rejecting an already-ready photograph", async () => {
    const first = vi.fn().mockResolvedValue({
      id: "media-1",
      event_id: "event-1",
      object_key: "originals/event-1/media-1/original",
      size_bytes: 8,
      declared_mime: "image/jpeg",
      created_at: "2026-07-16T10:00:00.000Z",
    });
    cloudflareEnv.DB.prepare.mockImplementation(() => ({ bind: vi.fn(() => ({ first })) }));
    cloudflareEnv.MEDIA.get.mockResolvedValue(null);
    qualityRepository.saveTechnicalAnalysisFailure.mockResolvedValue(undefined);

    await expect(processTechnicalAnalysis("media-1", "eventaj")).resolves.toBe("failed");
    expect(qualityRepository.saveTechnicalAnalysisFailure).toHaveBeenCalledWith(expect.objectContaining({
      mediaId: "media-1",
      eventId: "event-1",
      organizationId: "eventaj",
      errorCode: "TECHNICAL_ANALYSIS_FAILED",
    }), cloudflareEnv.DB);
    expect(cloudflareEnv.DB.prepare).toHaveBeenCalledOnce();
  });
});
