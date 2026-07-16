import { problem } from "@/lib/http/problem";
import { findPublicEvent } from "@/lib/repositories/events";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  return Response.json({
    event: {
      slug: event.public_slug,
      name: event.name,
      location: event.location,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      uploadsEnabled: Boolean(event.uploads_enabled),
      galleryEnabled: Boolean(event.gallery_enabled),
    },
  });
}
