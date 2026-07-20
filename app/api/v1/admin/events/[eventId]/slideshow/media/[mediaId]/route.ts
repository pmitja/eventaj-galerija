import { getAuthContext } from "@/lib/auth/context";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findEventById } from "@/lib/repositories/events";
import { setMediaSlideshowState } from "@/lib/repositories/slideshows";
import { slideshowMediaActionSchema } from "@/lib/validation/slideshow";

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string; mediaId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return problem(403, "INVALID_ORIGIN", "Izvor zahteve ni dovoljen");
  const { eventId, mediaId } = await params;
  if (!(await findEventById(eventId, context.organizationId))) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const parsed = slideshowMediaActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(422, "INVALID_SLIDESHOW_STATE", "Stanje projekcije ni veljavno");
  if (!(await setMediaSlideshowState(eventId, mediaId, parsed.data.state, context.organizationId))) {
    return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  }
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
     VALUES (?, ?, 'user', ?, 'slideshow.media_state_changed', 'media_file', ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(), eventId, context.email, mediaId,
    JSON.stringify({ slideshowState: parsed.data.state }), new Date().toISOString(),
  ).run();
  return Response.json({ mediaId, slideshowState: parsed.data.state });
}
