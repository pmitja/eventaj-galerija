import { getAuthContext } from "@/lib/auth/context";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findEventById } from "@/lib/repositories/events";
import { createAccessPoint, listEventAccessPoints } from "@/lib/repositories/access-points";
import { createAccessPointSchema } from "@/lib/validation/access-points";

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const { eventId } = await params;
  if (!(await findEventById(eventId, context.organizationId))) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  return Response.json({ accessPoints: await listEventAccessPoints(eventId, context.organizationId) });
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const { eventId } = await params;
  if (!(await findEventById(eventId, context.organizationId))) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const parsed = createAccessPointSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_ACCESS_POINT", "Dostopna točka ni veljavna", parsed.error.issues[0]?.message);
  }

  const accessPoint = await createAccessPoint({ eventId, ...parsed.data }, context.organizationId);
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, created_at)
     VALUES (?, ?, 'user', ?, 'access_point.created', 'access_point', ?, ?)`,
  ).bind(
    crypto.randomUUID(),
    eventId,
    context.email,
    accessPoint.id,
    new Date().toISOString(),
  ).run();
  return Response.json({ accessPoint }, { status: 201 });
}
