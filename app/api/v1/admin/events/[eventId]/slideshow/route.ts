import { getAuthContext } from "@/lib/auth/context";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findEventById } from "@/lib/repositories/events";
import { ensureOwnedSlideshow } from "@/lib/repositories/slideshows";

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const { eventId } = await params;
  if (!(await findEventById(eventId, context.organizationId))) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const env = getCloudflareEnv();
  const slideshow = await ensureOwnedSlideshow(eventId, context.organizationId);
  const baseUrl = env.PUBLIC_APP_URL.replace(/\/$/, "");
  return Response.json({
    slideshow: {
      url: `${baseUrl}/display/${encodeURIComponent(slideshow.access_token)}`,
      createdAt: slideshow.created_at,
    },
  }, { headers: { "cache-control": "no-store" } });
}
