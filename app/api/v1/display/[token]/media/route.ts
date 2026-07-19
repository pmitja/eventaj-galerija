import { problem } from "@/lib/http/problem";
import { findPublicSlideshow, listSlideshowMedia } from "@/lib/repositories/slideshows";
import { hashToken } from "@/lib/security/tokens";
import { getEngagementSnapshot } from "@/lib/repositories/engagement";
import { listLiveMediaComments } from "@/lib/repositories/media-comments";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const slideshow = await findPublicSlideshow(await hashToken(token));
  if (!slideshow) return problem(404, "SLIDESHOW_NOT_FOUND", "Projekcija ne obstaja ali povezava ni več veljavna");
  const [media, engagement, comments] = await Promise.all([
    listSlideshowMedia(slideshow.event_id),
    getEngagementSnapshot(slideshow.event_id),
    listLiveMediaComments(slideshow.event_id),
  ]);
  return Response.json({
    event: { name: slideshow.event_name },
    media: media.map((item) => ({
      publicId: item.public_id,
      filename: item.original_filename,
      uploadedAt: item.uploaded_at,
      imageUrl: `/api/v1/display/${encodeURIComponent(token)}/media/${item.public_id}`,
    })),
    engagement,
    comments,
  }, { headers: { "cache-control": "private, no-store, max-age=0" } });
}
