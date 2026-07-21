import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string; publicId: string }> }) {
  const { slug, publicId } = await params;
  const variant = new URL(request.url).searchParams.get("variant") === "thumbnail" ? "thumbnail_key" : "gallery_key";
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT m.gallery_key, m.thumbnail_key
     FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE e.public_slug = ? AND e.status IN ('active', 'ended') AND e.gallery_enabled = 1
       AND m.public_id = ? AND m.status = 'ready' AND m.gallery_state = 'visible' AND m.publication_consent = 1
       AND COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')`,
  ).bind(slug, publicId).first<{ gallery_key: string; thumbnail_key: string }>();
  if (!row) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  const key = row[variant];
  const object = await getCloudflareEnv().MEDIA.get(key);
  if (!object?.body) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
