import { getAuthContext } from "@/lib/auth/context";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findEventById, updateEventCommentsEnabled } from "@/lib/repositories/events";
import { updateEventCommentsSchema } from "@/lib/validation/events";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return problem(403, "INVALID_ORIGIN", "Izvor zahteve ni dovoljen");
  }

  const parsed = updateEventCommentsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_EVENT_SETTINGS", "Nastavitve dogodka niso veljavne", parsed.error.issues[0]?.message);
  }

  const { eventId } = await params;
  const event = await findEventById(eventId, context.organizationId);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");

  const updated = await updateEventCommentsEnabled(eventId, parsed.data.commentsEnabled, context.organizationId);
  if (!updated) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");

  await getCloudflareEnv().DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
     VALUES (?, ?, 'user', ?, 'event.comments.updated', 'event', ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(),
    eventId,
    context.email,
    eventId,
    JSON.stringify({ commentsEnabled: parsed.data.commentsEnabled }),
    new Date().toISOString(),
  ).run();

  return Response.json({ settings: { commentsEnabled: parsed.data.commentsEnabled } });
}
