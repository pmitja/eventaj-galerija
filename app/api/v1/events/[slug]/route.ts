import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { areUploadsOpen } from "@/lib/domain/events";
import { findPublicEvent } from "@/lib/repositories/events";
import { hasFaceCollectionsEntitlement } from "@/lib/repositories/face-search";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const faceSearchEnabled = String(getCloudflareEnv().FACE_SEARCH_ENABLED) === "true"
    && await hasFaceCollectionsEntitlement(event.id);
  return Response.json({
    event: {
      slug: event.public_slug,
      name: event.name,
      location: event.location,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      uploadsEnabled: Boolean(event.uploads_enabled),
      uploadsOpen: Boolean(event.uploads_enabled) && areUploadsOpen(event.ends_at),
      galleryEnabled: Boolean(event.gallery_enabled),
      commentsEnabled: Boolean(event.comments_enabled),
      faceSearchEnabled,
      faceSearchPolicyVersion: faceSearchEnabled ? getCloudflareEnv().FACE_SEARCH_POLICY_VERSION : null,
    },
  });
}
