import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string; publicId: string }> }) {
  const { slug, publicId } = await params;
  const variant = new URL(request.url).searchParams.get("variant") === "thumbnail" ? "thumbnail_key" : "gallery_key";
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT m.kind, m.gallery_key, m.thumbnail_key, m.poster_key
     FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE e.public_slug = ? AND e.status IN ('active', 'ended') AND e.gallery_enabled = 1
       AND m.public_id = ? AND m.status = 'ready' AND m.gallery_state = 'visible' AND m.publication_consent = 1
       AND (m.kind = 'video' OR COALESCE(m.quality_override, m.quality_category) IN ('best', 'good'))`,
  ).bind(slug, publicId).first<{ kind: "image" | "video"; gallery_key: string | null; thumbnail_key: string | null; poster_key: string | null }>();
  if (!row) return problem(404, "MEDIA_NOT_FOUND", "Datoteka ne obstaja");
  const key = row.kind === "video" ? row.poster_key : row[variant];
  if (!key) return problem(404, "MEDIA_NOT_FOUND", "Predogled ne obstaja");
  const object = await getCloudflareEnv().MEDIA.get(key);
  if (!object?.body) return problem(404, "MEDIA_NOT_FOUND", "Datoteka ne obstaja");
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
