import { auth } from "@/auth";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";

export async function GET(_request: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  if (!(await auth())) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const { mediaId } = await params;
  const { DB, MEDIA, ORGANIZATION_ID } = getCloudflareEnv();
  const row = await DB.prepare(
    `SELECT m.thumbnail_key FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE m.id = ? AND e.organization_id = ? AND m.status = 'ready'`,
  ).bind(mediaId, ORGANIZATION_ID).first<{ thumbnail_key: string | null }>();
  if (!row?.thumbnail_key) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  const object = await MEDIA.get(row.thumbnail_key);
  if (!object?.body) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, max-age=300");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
