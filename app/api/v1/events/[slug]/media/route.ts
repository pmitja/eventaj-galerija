import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findPublicEvent } from "@/lib/repositories/events";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT public_id, original_filename, uploaded_at
     FROM media_files
     WHERE event_id = ? AND status = 'ready' AND gallery_state = 'visible' AND publication_consent = 1
     ORDER BY uploaded_at DESC LIMIT 100`,
  ).bind(event.id).all<{ public_id: string; original_filename: string; uploaded_at: string }>();
  return Response.json({ media: result.results.map((item) => ({
    publicId: item.public_id,
    filename: item.original_filename,
    uploadedAt: item.uploaded_at,
    thumbnailUrl: `/api/v1/events/${slug}/media/${item.public_id}?variant=thumbnail`,
    imageUrl: `/api/v1/events/${slug}/media/${item.public_id}?variant=gallery`,
  })) });
}
