import { auth } from "@/auth";
import { problem } from "@/lib/http/problem";
import { insertEvent, listEvents } from "@/lib/repositories/events";
import { createEventSchema } from "@/lib/validation/events";
import { getCloudflareEnv } from "@/lib/cloudflare";

export async function GET() {
  if (!(await auth())) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  return Response.json({ events: await listEvents() });
}

export async function POST(request: Request) {
  if (!(await auth())) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const parsed = createEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_EVENT", "Podatki dogodka niso veljavni", parsed.error.issues[0]?.message);
  }
  const event = await insertEvent(parsed.data);
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, created_at)
     VALUES (?, ?, 'user', ?, 'event.created', 'event', ?, ?)`,
  ).bind(crypto.randomUUID(), event.id, "info@eventaj.si", event.id, new Date().toISOString()).run();
  return Response.json({ event }, { status: 201 });
}
