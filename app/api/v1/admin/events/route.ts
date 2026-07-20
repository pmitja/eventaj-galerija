import { getAuthContext } from "@/lib/auth/context";
import { problem } from "@/lib/http/problem";
import { insertEvent, listEvents } from "@/lib/repositories/events";
import { createEventSchema } from "@/lib/validation/events";
import { getCloudflareEnv } from "@/lib/cloudflare";

export async function GET() {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  return Response.json({ events: await listEvents(context.organizationId) });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  if (!context.platformAdmin) return problem(403, "PAYMENT_REQUIRED", "Nov dogodek ustvari prek plačila");
  const parsed = createEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_EVENT", "Podatki dogodka niso veljavni", parsed.error.issues[0]?.message);
  }
  const event = await insertEvent(parsed.data, context.organizationId);
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, created_at)
     VALUES (?, ?, 'user', ?, 'event.created', 'event', ?, ?)`,
  ).bind(crypto.randomUUID(), event.id, context.email, event.id, new Date().toISOString()).run();
  return Response.json({ event }, { status: 201 });
}
