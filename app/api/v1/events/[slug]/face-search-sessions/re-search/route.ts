import { getCloudflareEnv } from "@/lib/cloudflare";
import { FACE_SEARCH_MAX_SESSIONS_PER_HOUR } from "@/lib/domain/face-search";
import { problem } from "@/lib/http/problem";
import { guestBelongsToEvent } from "@/lib/repositories/guest-identities";
import { findPublicEvent } from "@/lib/repositories/events";
import {
  countRecentFaceSearchSessions,
  createFaceReSearchSession,
  hasFaceCollectionsEntitlement,
  markFaceJobsEnqueued,
  prepareFaceSearch,
} from "@/lib/repositories/face-search";
import { createPublicToken, hashToken } from "@/lib/security/tokens";
import { createFaceReSearchSessionSchema, type FaceQueueMessage } from "@/lib/validation/face-search";

// Re-runs a face search against newly added event photos using the guest's
// stored selfie face (probe), so "Osveži" never asks for a fresh selfie.
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
  const parsed = createFaceReSearchSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(422, "INVALID_RE_SEARCH", "Zahteva ni veljavna", parsed.error.issues[0]?.message);
  if (parsed.data.policyVersion !== getCloudflareEnv().FACE_SEARCH_POLICY_VERSION) {
    return problem(409, "FACE_POLICY_CHANGED", "Besedilo soglasja je bilo posodobljeno. Osveži stran in poskusi znova.");
  }
  if (!(await guestBelongsToEvent(event.id, parsed.data.guestId))) {
    return problem(409, "GUEST_NOT_FOUND", "Lokalna identiteta za ta dogodek ni registrirana");
  }
  if ((await countRecentFaceSearchSessions(event.id, parsed.data.guestId)) >= FACE_SEARCH_MAX_SESSIONS_PER_HOUR) {
    return problem(429, "FACE_SEARCH_RATE_LIMIT", "Doseženo je največje število iskanj. Poskusi znova čez eno uro.");
  }

  const token = createPublicToken();
  const session = await createFaceReSearchSession({
    eventId: event.id,
    organizationId: event.organization_id,
    guestId: parsed.data.guestId,
    tokenHash: await hashToken(token),
  });
  if (!session) {
    return problem(409, "FACE_PROBE_MISSING", "Shranjenega obraza ni več. Znova posnemi selfie.");
  }

  const env = getCloudflareEnv();
  const jobs = await prepareFaceSearch(session);
  const indexMessages: FaceQueueMessage[] = jobs.map((job) => ({
    kind: "index",
    jobId: job.id,
    mediaId: job.media_file_id,
    organizationId: session.organization_id,
  }));
  try {
    for (let offset = 0; offset < indexMessages.length; offset += 100) {
      await env.FACE_PROCESSING_QUEUE.sendBatch(indexMessages.slice(offset, offset + 100).map((body) => ({ body })));
    }
    await markFaceJobsEnqueued(jobs.map((job) => job.id), session.organization_id);
    await env.FACE_PROCESSING_QUEUE.send({
      kind: "search",
      sessionId: session.id,
      organizationId: session.organization_id,
    } satisfies FaceQueueMessage, { delaySeconds: indexMessages.length > 0 ? 5 : 0 });
  } catch {
    console.error(JSON.stringify({ event: "face_search.re_search_enqueue_failed", sessionId: session.id, eventId: session.event_id }));
    return problem(503, "FACE_QUEUE_UNAVAILABLE", "Iskanja trenutno ni mogoče zagnati. Poskusi znova.");
  }
  return Response.json({ token, status: "queued", expiresAt: session.expires_at }, {
    status: 202,
    headers: { "cache-control": "no-store" },
  });
}
