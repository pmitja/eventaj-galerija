import { problem } from "@/lib/http/problem";
import { findPublicEvent } from "@/lib/repositories/events";
import { listPublicGalleryMedia } from "@/lib/repositories/public-gallery";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const media = await listPublicGalleryMedia(event.id);
  return Response.json(
    { media: media.map((item) => ({
      publicId: item.public_id,
      filename: item.original_filename,
      uploadedAt: item.uploaded_at,
      commentCount: item.comment_count,
      thumbnailUrl: `/api/v1/events/${slug}/media/${item.public_id}?variant=thumbnail`,
      imageUrl: `/api/v1/events/${slug}/media/${item.public_id}?variant=gallery`,
    })) },
    { headers: { "cache-control": "private, no-store, max-age=0" } },
  );
}
