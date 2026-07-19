import { getCloudflareEnv } from "@/lib/cloudflare";
import { FACE_SEARCH_MAX_SESSIONS_PER_HOUR } from "@/lib/domain/face-search";
import { problem } from "@/lib/http/problem";
import { guestBelongsToEvent } from "@/lib/repositories/guest-identities";
import { findPublicEvent } from "@/lib/repositories/events";
import {
  countRecentFaceSearchSessions,
  createFaceSearchSession,
  hasFaceCollectionsEntitlement,
} from "@/lib/repositories/face-search";
import { createPublicToken, hashToken } from "@/lib/security/tokens";
import { createPresignedUploadUrl, PRESIGNED_UPLOAD_TTL_SECONDS } from "@/lib/storage/r2";
import { createFaceSearchSessionSchema } from "@/lib/validation/face-search";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  if (String(getCloudflareEnv().FACE_SEARCH_ENABLED) !== "true") {
    return problem(503, "FACE_SEARCH_UNAVAILABLE", "Iskanje po obrazu trenutno ni na voljo");
  }
  if (!(await hasFaceCollectionsEntitlement(event.id))) {
    return problem(403, "FACE_SEARCH_DISABLED", "Iskanje po obrazu za ta dogodek ni omogočeno");
  }
  const parsed = createFaceSearchSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(422, "INVALID_SELFIE", "Selfie ali soglasje ni veljavno", parsed.error.issues[0]?.message);
  const expectedPolicy = getCloudflareEnv().FACE_SEARCH_POLICY_VERSION;
  if (parsed.data.policyVersion !== expectedPolicy) {
    return problem(409, "FACE_POLICY_CHANGED", "Besedilo soglasja je bilo posodobljeno. Osveži stran in poskusi znova.");
  }
  if (!(await guestBelongsToEvent(event.id, parsed.data.guestId))) {
    return problem(409, "GUEST_NOT_FOUND", "Lokalna identiteta za ta dogodek ni registrirana");
  }
  if ((await countRecentFaceSearchSessions(event.id, parsed.data.guestId)) >= FACE_SEARCH_MAX_SESSIONS_PER_HOUR) {
    return problem(429, "FACE_SEARCH_RATE_LIMIT", "Doseženo je največje število iskanj. Poskusi znova čez eno uro.");
  }

  const token = createPublicToken();
  const sessionId = crypto.randomUUID();
  const objectKey = `temporary/face-search/${event.id}/${sessionId}/selfie`;
  let uploadUrl: string;
  try {
    uploadUrl = await createPresignedUploadUrl(objectKey, parsed.data.mime);
  } catch {
    return problem(503, "FACE_STORAGE_UNAVAILABLE", "Shramba za selfie trenutno ni dosegljiva");
  }
  const session = await createFaceSearchSession({
    eventId: event.id,
    organizationId: event.organization_id,
    guestId: parsed.data.guestId,
    tokenHash: await hashToken(token),
    objectKey,
    mime: parsed.data.mime,
    sizeBytes: parsed.data.sizeBytes,
    policyVersion: parsed.data.policyVersion,
  });
  return Response.json({
    token,
    uploadUrl,
    expiresAt: session.expires_at,
    uploadUrlExpiresInSeconds: PRESIGNED_UPLOAD_TTL_SECONDS,
  }, { status: 201, headers: { "cache-control": "no-store" } });
}
