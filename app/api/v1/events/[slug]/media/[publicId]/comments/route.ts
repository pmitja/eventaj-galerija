import { problem } from "@/lib/http/problem";
import { findPublicEvent } from "@/lib/repositories/events";
import { createMediaComment, listMediaComments } from "@/lib/repositories/media-comments";
import { createMediaCommentSchema } from "@/lib/validation/media-comments";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string; publicId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug, publicId } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  if (!event.comments_enabled) return problem(403, "COMMENTS_DISABLED", "Komentarji za ta dogodek niso omogočeni");
  const comments = await listMediaComments(event.id, publicId);
  if (!comments) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  return Response.json({ comments }, { headers: { "cache-control": "private, no-store, max-age=0" } });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug, publicId } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  if (!event.comments_enabled) return problem(403, "COMMENTS_DISABLED", "Komentarji za ta dogodek niso omogočeni");

  const parsed = createMediaCommentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_MEDIA_COMMENT", "Komentar ni veljaven", parsed.error.issues[0]?.message);
  }

  const result = await createMediaComment(event.id, publicId, parsed.data);
  if (result.status === "guest_not_found") return problem(403, "GUEST_NOT_FOUND", "Identiteta gosta za ta dogodek ni veljavna");
  if (result.status === "media_not_found") return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  if (result.status === "rate_limited") {
    return Response.json({
      type: "https://app.eventaj.si/problems/comment-rate-limited",
      title: "Počakaj trenutek in poskusi znova.",
      status: 429,
      code: "COMMENT_RATE_LIMITED",
    }, { status: 429, headers: { "content-type": "application/problem+json", "retry-after": "60" } });
  }
  return Response.json({ comment: result.comment }, { status: 201 });
}
