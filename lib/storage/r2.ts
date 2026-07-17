import { AwsClient } from "aws4fetch";
import { invalidatePublicGallery } from "@/lib/cache/public-gallery";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { EXPORT_DOWNLOAD_TTL_SECONDS } from "@/lib/domain/exports";
import {
  ANALYSIS_SIZE,
  inspectAndChecksum,
  persistTechnicalAnalysis,
  processTechnicalAnalysis as processTechnicalAnalysisWithRuntime,
  recordTechnicalAnalysisFailure,
  type TechnicalAnalysisMedia,
  type TechnicalAnalysisRuntime,
} from "@/lib/storage/technical-analysis";

export const PRESIGNED_UPLOAD_TTL_SECONDS = 10 * 60;

function signingClient() {
  const env = getCloudflareEnv();
  if (!env.R2_ACCOUNT_ID || !env.R2_BUCKET_NAME || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 signing configuration is incomplete");
  }
  return {
    client: new AwsClient({
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      service: "s3",
      region: "auto",
    }),
    env,
  };
}

function r2ObjectUrl(objectKey: string, accountId: string, bucketName: string): URL {
  const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");
  return new URL(`https://${accountId}.eu.r2.cloudflarestorage.com/${bucketName}/${encodedKey}`);
}

export async function createPresignedUploadUrl(objectKey: string, contentType: string): Promise<string> {
  const { client, env } = signingClient();
  const url = r2ObjectUrl(objectKey, env.R2_ACCOUNT_ID, env.R2_BUCKET_NAME);
  url.searchParams.set("X-Amz-Expires", String(PRESIGNED_UPLOAD_TTL_SECONDS));
  const request = await client.sign(url, {
    method: "PUT",
    headers: { "content-type": contentType },
    aws: { signQuery: true, allHeaders: true },
  });
  return request.url;
}

export async function createPresignedDownloadUrl(objectKey: string): Promise<string> {
  const { client, env } = signingClient();
  const url = r2ObjectUrl(objectKey, env.R2_ACCOUNT_ID, env.R2_BUCKET_NAME);
  url.searchParams.set("X-Amz-Expires", String(EXPORT_DOWNLOAD_TTL_SECONDS));
  const request = await client.sign(url, { method: "GET", aws: { signQuery: true } });
  return request.url;
}

function requireTechnicalAnalysisRuntime(env: CloudflareEnv | TechnicalAnalysisRuntime): TechnicalAnalysisRuntime {
  if (!env.IMAGES) throw new Error("Cloudflare Images binding is unavailable");
  return { DB: env.DB, MEDIA: env.MEDIA, IMAGES: env.IMAGES };
}

export async function processImage(mediaId: string, organizationId: string): Promise<void> {
  const env = getCloudflareEnv();
  const analysisEnv = requireTechnicalAnalysisRuntime(env);
  const media = await env.DB.prepare(
    `SELECT m.id, m.event_id, m.object_key, m.size_bytes, m.declared_mime, m.created_at
     FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE m.id = ? AND e.organization_id = ?`,
  ).bind(mediaId, organizationId).first<TechnicalAnalysisMedia>();
  if (!media) return;

  const [originalForInspection, originalForGallery, originalForThumbnail, originalForAnalysis] = await Promise.all([
    env.MEDIA.get(media.object_key),
    env.MEDIA.get(media.object_key),
    env.MEDIA.get(media.object_key),
    env.MEDIA.get(media.object_key),
  ]);
  const originals = [originalForInspection, originalForGallery, originalForThumbnail, originalForAnalysis];
  if (originals.some((object) => !object?.body || object.size !== media.size_bytes)) {
    await env.MEDIA.delete(media.object_key);
    await env.DB.prepare(
      `UPDATE media_files SET status = 'rejected' WHERE id = ? AND event_id = ? AND EXISTS (
        SELECT 1 FROM events e WHERE e.id = media_files.event_id AND e.organization_id = ?
      )`,
    ).bind(media.id, media.event_id, organizationId).run();
    return;
  }

  let becameReady = false;
  let analysisBytes: Uint8Array | null = null;
  let inspection: { checksumSha256: string; width: number; height: number } | null = null;
  try {
    const analysisPromise = analysisEnv.IMAGES.input(originalForAnalysis!.body!)
      .transform({ width: ANALYSIS_SIZE, height: ANALYSIS_SIZE, fit: "squeeze" })
      .output({ format: "rgba" })
      .then((result) => result.response().arrayBuffer())
      .then((buffer) => new Uint8Array(buffer))
      .catch(() => null);
    const [inspected, galleryResult, thumbnailResult] = await Promise.all([
      inspectAndChecksum(analysisEnv.IMAGES, originalForInspection!.body!, media.declared_mime),
      analysisEnv.IMAGES.input(originalForGallery!.body!)
        .transform({ width: 1920, fit: "scale-down" })
        .output({ format: "image/webp", quality: 82 }),
      analysisEnv.IMAGES.input(originalForThumbnail!.body!)
        .transform({ width: 480, height: 480, fit: "cover" })
        .output({ format: "image/webp", quality: 76 }),
    ]);
    inspection = inspected;
    const gallery = galleryResult.response();
    const thumbnail = thumbnailResult.response();

    const galleryKey = `derived/${media.event_id}/${media.id}/gallery.webp`;
    const thumbnailKey = `derived/${media.event_id}/${media.id}/thumbnail.webp`;
    await Promise.all([
      env.MEDIA.put(galleryKey, gallery.body, { httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" } }),
      env.MEDIA.put(thumbnailKey, thumbnail.body, { httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" } }),
    ]);
    analysisBytes = await analysisPromise;
    const result = await env.DB.prepare(
      `UPDATE media_files
       SET status = 'ready', gallery_key = ?, thumbnail_key = ?, uploaded_at = ?,
           checksum_sha256 = ?, width = ?, height = ?
       WHERE id = ? AND event_id = ? AND status = 'processing' AND EXISTS (
         SELECT 1 FROM events e WHERE e.id = media_files.event_id AND e.organization_id = ?
       )`,
    ).bind(
      galleryKey,
      thumbnailKey,
      new Date().toISOString(),
      inspection.checksumSha256,
      inspection.width,
      inspection.height,
      media.id,
      media.event_id,
      organizationId,
    ).run();
    becameReady = result.meta.changes === 1;
  } catch {
    await env.DB.prepare(
      `UPDATE media_files SET status = 'rejected' WHERE id = ? AND event_id = ? AND EXISTS (
        SELECT 1 FROM events e WHERE e.id = media_files.event_id AND e.organization_id = ?
      )`,
    ).bind(media.id, media.event_id, organizationId).run();
    return;
  }
  if (!becameReady || !inspection) return;
  invalidatePublicGallery(media.event_id);

  if (!analysisBytes) {
    await recordTechnicalAnalysisFailure(analysisEnv, media, organizationId, "ANALYSIS_TRANSFORM_FAILED");
    return;
  }

  try {
    await persistTechnicalAnalysis(analysisEnv, media, organizationId, inspection, analysisBytes);
  } catch {
    await recordTechnicalAnalysisFailure(analysisEnv, media, organizationId, "TECHNICAL_ANALYSIS_FAILED");
  }
}

export async function processTechnicalAnalysis(
  mediaId: string,
  organizationId: string,
  runtime?: TechnicalAnalysisRuntime,
): Promise<"completed" | "failed" | "not_found"> {
  return processTechnicalAnalysisWithRuntime(mediaId, organizationId, requireTechnicalAnalysisRuntime(runtime ?? getCloudflareEnv()));
}
