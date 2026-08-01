import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; publicId: string }> }) {
  const { slug, publicId } = await params;
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT m.stream_uid FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE e.public_slug = ? AND e.status IN ('active', 'ended') AND e.gallery_enabled = 1
       AND m.public_id = ? AND m.kind = 'video' AND m.status = 'ready'
       AND m.gallery_state = 'visible' AND m.publication_consent = 1`,
  ).bind(slug, publicId).first<{ stream_uid: string | null }>();
  if (!row?.stream_uid) return problem(404, "MEDIA_NOT_FOUND", "Video ne obstaja");
  const handle = getCloudflareEnv().STREAM.video(row.stream_uid);
  const [details, token] = await Promise.all([handle.details(), handle.generateToken()]);
  const signedUrl = details.hlsPlaybackUrl.replace(row.stream_uid, token);
  return Response.redirect(signedUrl, 307);
}
