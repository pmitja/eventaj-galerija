import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { createPresignedDownloadUrl } from "@/lib/storage/r2";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; publicId: string }> }) {
  const { slug, publicId } = await params;
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT m.object_key, m.original_filename
     FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE e.public_slug = ? AND e.status IN ('active', 'ended') AND e.gallery_enabled = 1
       AND m.public_id = ? AND m.kind = 'image' AND m.status = 'ready'
       AND m.gallery_state = 'visible' AND m.publication_consent = 1
       AND COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')`,
  ).bind(slug, publicId).first<{ object_key: string; original_filename: string }>();
  if (!row) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");

  try {
    return Response.redirect(await createPresignedDownloadUrl(row.object_key, row.original_filename), 302);
  } catch {
    return problem(503, "DOWNLOAD_UNAVAILABLE", "Prenos trenutno ni na voljo");
  }
}
