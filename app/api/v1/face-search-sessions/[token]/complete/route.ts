import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import {
  findFaceSearchSessionByTokenHash,
  markFaceJobsEnqueued,
  prepareFaceSearch,
} from "@/lib/repositories/face-search";
import { hashToken } from "@/lib/security/tokens";
import type { FaceQueueMessage } from "@/lib/validation/face-search";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await findFaceSearchSessionByTokenHash(await hashToken(token));
  if (!session) return problem(401, "INVALID_FACE_SEARCH_SESSION", "Iskalna seja ni veljavna");
  if (session.status === "completed" || session.status === "queued" || session.status === "searching") {
    return Response.json({ status: session.status }, { status: 202 });
  }
  if (session.status !== "awaiting_upload" || new Date(session.expires_at).getTime() <= Date.now()) {
    return problem(410, "FACE_SEARCH_EXPIRED", "Iskalna seja je potekla");
  }
  if (!session.selfie_object_key) return problem(410, "SELFIE_DELETED", "Začasni selfie je že izbrisan");
  const env = getCloudflareEnv();
  const object = await env.MEDIA.head(session.selfie_object_key);
  if (!object || object.size !== session.size_bytes || object.httpMetadata?.contentType !== session.declared_mime) {
    await env.MEDIA.delete(session.selfie_object_key);
    return problem(422, "SELFIE_METADATA_MISMATCH", "Naloženi selfie se ne ujema s pripravljeno datoteko");
  }

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
    console.error(JSON.stringify({ event: "face_search.enqueue_failed", sessionId: session.id, eventId: session.event_id }));
    return problem(503, "FACE_QUEUE_UNAVAILABLE", "Iskanja trenutno ni mogoče zagnati. Poskusi znova.");
  }
  return Response.json({ status: "queued" }, { status: 202, headers: { "cache-control": "no-store" } });
}
