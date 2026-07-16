import { AwsClient } from "aws4fetch";
import { getCloudflareEnv } from "@/lib/cloudflare";

export const PRESIGNED_UPLOAD_TTL_SECONDS = 10 * 60;

export async function createPresignedUploadUrl(objectKey: string, contentType: string): Promise<string> {
  const env = getCloudflareEnv();
  if (!env.R2_ACCOUNT_ID || !env.R2_BUCKET_NAME || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 signing configuration is incomplete");
  }
  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });
  const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");
  const url = new URL(`https://${env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${encodedKey}`);
  url.searchParams.set("X-Amz-Expires", String(PRESIGNED_UPLOAD_TTL_SECONDS));
  const request = await client.sign(url, {
    method: "PUT",
    headers: { "content-type": contentType },
    aws: { signQuery: true, allHeaders: true },
  });
  return request.url;
}

export async function processImage(mediaId: string): Promise<void> {
  const env = getCloudflareEnv();
  const media = await env.DB.prepare("SELECT * FROM media_files WHERE id = ?").bind(mediaId).first<{
    id: string;
    event_id: string;
    object_key: string;
    size_bytes: number;
  }>();
  if (!media) return;

  const originalForGallery = await env.MEDIA.get(media.object_key);
  const originalForThumbnail = await env.MEDIA.get(media.object_key);
  if (!originalForGallery?.body || !originalForThumbnail?.body || originalForGallery.size !== media.size_bytes) {
    await env.MEDIA.delete(media.object_key);
    await env.DB.prepare("UPDATE media_files SET status = 'rejected' WHERE id = ?").bind(media.id).run();
    return;
  }

  try {
    const gallery = (await env.IMAGES.input(originalForGallery.body)
      .transform({ width: 1920, fit: "scale-down" })
      .output({ format: "image/webp", quality: 82 }))
      .response();
    const thumbnail = (await env.IMAGES.input(originalForThumbnail.body)
      .transform({ width: 480, height: 480, fit: "cover" })
      .output({ format: "image/webp", quality: 76 }))
      .response();

    const galleryKey = `derived/${media.event_id}/${media.id}/gallery.webp`;
    const thumbnailKey = `derived/${media.event_id}/${media.id}/thumbnail.webp`;
    await Promise.all([
      env.MEDIA.put(galleryKey, gallery.body, { httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" } }),
      env.MEDIA.put(thumbnailKey, thumbnail.body, { httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" } }),
    ]);
    await env.DB.prepare(
      "UPDATE media_files SET status = 'ready', gallery_key = ?, thumbnail_key = ?, uploaded_at = ? WHERE id = ? AND status = 'processing'",
    ).bind(galleryKey, thumbnailKey, new Date().toISOString(), media.id).run();
  } catch {
    await env.DB.prepare("UPDATE media_files SET status = 'rejected' WHERE id = ?").bind(media.id).run();
  }
}
