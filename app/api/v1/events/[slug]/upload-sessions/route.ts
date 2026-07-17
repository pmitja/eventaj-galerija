import { problem } from "@/lib/http/problem";
import { findPublicEvent } from "@/lib/repositories/events";
import { createUploadSession } from "@/lib/repositories/uploads";
import { findActiveAccessPoint } from "@/lib/repositories/access-points";
import { createPublicToken, hashToken } from "@/lib/security/tokens";

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  if (!event || !event.uploads_enabled) return problem(404, "UPLOADS_DISABLED", "Nalaganje ni na voljo");
  if (new Date(event.ends_at).getTime() + 15 * 60 * 1000 < Date.now()) {
    return problem(410, "EVENT_ENDED", "Nalaganje za ta dogodek je zaključeno");
  }
  const accessPointCode = cookieValue(request, "eventaj_access_point");
  const accessPoint = accessPointCode ? await findActiveAccessPoint(accessPointCode) : null;
  const accessPointId = accessPoint?.event_id === event.id ? accessPoint.id : null;
  const token = createPublicToken();
  const session = await createUploadSession(
    event.id,
    event.organization_id,
    await hashToken(token),
    accessPointId,
  );
  return Response.json({ token, expiresAt: session.expires_at }, { status: 201 });
}
