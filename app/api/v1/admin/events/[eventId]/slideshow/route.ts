import { auth } from "@/auth";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findEventById } from "@/lib/repositories/events";
import { findOwnedSlideshow, rotateSlideshow } from "@/lib/repositories/slideshows";
import { createPublicToken, hashToken } from "@/lib/security/tokens";

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  if (!(await auth())) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const { eventId } = await params;
  if (!(await findEventById(eventId))) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const slideshow = await findOwnedSlideshow(eventId);
  return Response.json({ slideshow: slideshow ? { active: slideshow.status === "active", rotatedAt: slideshow.rotated_at } : null });
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth();
  if (!session) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return problem(403, "INVALID_ORIGIN", "Izvor zahteve ni dovoljen");
  const { eventId } = await params;
  if (!(await findEventById(eventId))) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");

  const token = createPublicToken(32);
  const slideshow = await rotateSlideshow(eventId, await hashToken(token));
  const env = getCloudflareEnv();
  await env.DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, created_at)
     VALUES (?, ?, 'user', ?, 'slideshow.rotated', 'slideshow', ?, ?)`,
  ).bind(
    crypto.randomUUID(), eventId, session.user?.email ?? "eventaj-admin", slideshow.id, new Date().toISOString(),
  ).run();
  const baseUrl = env.PUBLIC_APP_URL.replace(/\/$/, "");
  return Response.json({
    slideshow: {
      url: `${baseUrl}/display/${token}`,
      rotatedAt: slideshow.rotated_at,
    },
  }, { status: 201, headers: { "cache-control": "no-store" } });
}
