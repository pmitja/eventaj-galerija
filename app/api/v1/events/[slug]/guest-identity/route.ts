import { problem } from "@/lib/http/problem";
import { findPublicEvent } from "@/lib/repositories/events";
import { saveGuestIdentity } from "@/lib/repositories/guest-identities";
import { guestIdentitySchema } from "@/lib/validation/guest-identity";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");

  const parsed = guestIdentitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_GUEST_IDENTITY", "Identiteta gosta ni veljavna", parsed.error.issues[0]?.message);
  }
  if (parsed.data.displayName === null && parsed.data.showOnLiveScreen) {
    return problem(422, "ANONYMOUS_LIVE_NAME", "Anonimnega gosta ni mogoče prikazati na projekciji");
  }

  const result = await saveGuestIdentity(event.id, parsed.data);
  if (result.status === "guest_id_conflict") {
    return problem(409, "GUEST_ID_CONFLICT", "Lokalna identiteta pripada drugemu dogodku");
  }
  if (result.status === "name_taken") {
    return Response.json({
      type: "https://app.eventaj.si/problems/display-name-taken",
      title: "To ime že uporablja drug gost.",
      status: 409,
      code: "DISPLAY_NAME_TAKEN",
      suggestions: result.suggestions,
    }, { status: 409, headers: { "content-type": "application/problem+json" } });
  }

  return Response.json({
    guest: {
      guestId: result.guest.id,
      displayName: result.guest.display_name,
      showOnLiveScreen: Boolean(result.guest.show_on_live_screen),
    },
  }, { status: 201 });
}

