import { getAuthContext } from "@/lib/auth/context";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import {
  markMediaProcessingEnqueued,
  markMediaProcessingEnqueueFailed,
  retryFailedMediaProcessingJob,
} from "@/lib/repositories/media-processing";
import { mediaQualityParamsSchema } from "@/lib/validation/admin";

function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string; mediaId: string }> },
) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  if (!hasValidOrigin(request)) return problem(403, "INVALID_ORIGIN", "Izvor zahteve ni dovoljen");
  const parsed = mediaQualityParamsSchema.safeParse(await params);
  if (!parsed.success) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");

  const env = getCloudflareEnv();
  const job = await retryFailedMediaProcessingJob(env.DB, {
    ...parsed.data,
    organizationId: context.organizationId,
  });
  if (!job) return problem(409, "PROCESSING_NOT_RETRYABLE", "Obdelave trenutno ni mogoče ponoviti");

  try {
    await env.MEDIA_PROCESSING_QUEUE.send({
      jobId: job.id,
      mediaId: job.media_file_id,
      organizationId: job.organization_id,
    });
    await markMediaProcessingEnqueued(env.DB, job.id, job.organization_id);
  } catch {
    await markMediaProcessingEnqueueFailed(env.DB, job.id, job.organization_id);
  }

  await env.DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
     VALUES (?, ?, 'user', ?, 'media.processing_retried', 'media_file', ?, NULL, ?)`,
  ).bind(
    crypto.randomUUID(),
    parsed.data.eventId,
    context.email,
    parsed.data.mediaId,
    new Date().toISOString(),
  ).run();

  return Response.json({ mediaId: parsed.data.mediaId, processingStatus: "queued" }, {
    status: 202,
    headers: { "cache-control": "no-store" },
  });
}
