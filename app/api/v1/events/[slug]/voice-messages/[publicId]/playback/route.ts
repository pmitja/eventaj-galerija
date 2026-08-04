import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { createPresignedDownloadUrl } from "@/lib/storage/r2";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; publicId: string }> }) {
  const { slug, publicId } = await params;
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT v.object_key
     FROM voice_messages v JOIN events e ON e.id = v.event_id
     WHERE e.public_slug = ? AND e.status IN ('active', 'ended') AND e.gallery_enabled = 1
       AND v.public_id = ? AND v.status = 'ready' AND v.publication_consent = 1`,
  ).bind(slug, publicId).first<{ object_key: string }>();
  if (!row) return problem(404, "VOICE_MESSAGE_NOT_FOUND", "Glasovno voščilo ne obstaja");
  try {
    return Response.redirect(await createPresignedDownloadUrl(row.object_key), 302);
  } catch {
    return problem(503, "PLAYBACK_UNAVAILABLE", "Predvajanje trenutno ni na voljo");
  }
}
