import { processImage, type MediaProcessingRuntime } from "../lib/storage/r2";
import {
  mediaProcessingQueueMessageSchema,
  type MediaProcessingQueueMessage,
} from "../lib/validation/media-processing";

interface Env extends MediaProcessingRuntime {
  MEDIA_PROCESSING_QUEUE: Queue<MediaProcessingQueueMessage>;
}

type JobRow = {
  id: string;
  media_file_id: string;
  organization_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  attempt_count: number;
};

const MAX_JOB_ATTEMPTS = 5;
const STALE_AFTER_MINUTES = 2;

async function claimJob(
  env: Env,
  input: MediaProcessingQueueMessage,
  queueAttempt: number,
): Promise<JobRow | null> {
  const job = await env.DB.prepare(
    `SELECT j.id, j.media_file_id, j.organization_id, j.status, j.attempt_count
     FROM media_processing_jobs j
     JOIN media_files m ON m.id = j.media_file_id
     JOIN events e ON e.id = m.event_id
     WHERE j.id = ? AND j.media_file_id = ? AND j.organization_id = ?
       AND e.organization_id = ?`,
  ).bind(input.jobId, input.mediaId, input.organizationId, input.organizationId).first<JobRow>();
  if (!job || job.status === "completed" || job.status === "failed") return null;
  if (job.status === "processing" && queueAttempt === 1) return null;
  if (job.attempt_count >= MAX_JOB_ATTEMPTS) {
    await markJobFailed(env, job.id, job.organization_id, "PROCESSING_ATTEMPTS_EXHAUSTED");
    return null;
  }
  const result = await env.DB.prepare(
    `UPDATE media_processing_jobs
     SET status = 'processing', attempt_count = attempt_count + 1,
         processing_started_at = ?, error_code = NULL, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = ?`,
  ).bind(
    new Date().toISOString(),
    new Date().toISOString(),
    job.id,
    job.organization_id,
    job.status,
  ).run();
  return result.meta.changes === 1 ? { ...job, status: "processing", attempt_count: job.attempt_count + 1 } : null;
}

async function markJobCompleted(env: Env, job: JobRow): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE media_processing_jobs
     SET status = 'completed', error_code = NULL, completed_at = ?, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = 'processing'`,
  ).bind(now, now, job.id, job.organization_id).run();
}

async function markJobQueued(env: Env, job: JobRow, errorCode: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE media_processing_jobs
     SET status = 'queued', error_code = ?, processing_started_at = NULL, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = 'processing'`,
  ).bind(errorCode, new Date().toISOString(), job.id, job.organization_id).run();
}

async function markJobFailed(
  env: Env,
  jobId: string,
  organizationId: string,
  errorCode: string,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE media_processing_jobs
     SET status = 'failed', error_code = ?, completed_at = ?, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status != 'completed'`,
  ).bind(errorCode, new Date().toISOString(), new Date().toISOString(), jobId, organizationId).run();
}

function processingErrorCode(error: unknown): string {
  if (error instanceof Error && /^[A-Z][A-Z_]+$/.test(error.message)) return error.message;
  return "MEDIA_PROCESSING_FAILED";
}

async function processMessage(env: Env, message: Message<MediaProcessingQueueMessage>): Promise<void> {
  const parsed = mediaProcessingQueueMessageSchema.safeParse(message.body);
  if (!parsed.success) {
    console.error(JSON.stringify({ event: "media_processing.invalid_message", messageId: message.id }));
    message.ack();
    return;
  }
  const job = await claimJob(env, parsed.data, message.attempts);
  if (!job) {
    message.ack();
    return;
  }
  try {
    await processImage(job.media_file_id, job.organization_id, env);
    await markJobCompleted(env, job);
    message.ack();
  } catch (error) {
    const errorCode = processingErrorCode(error);
    console.error(JSON.stringify({
      event: "media_processing.failed",
      jobId: job.id,
      mediaId: job.media_file_id,
      attempt: job.attempt_count,
      errorCode,
    }));
    if (job.attempt_count < MAX_JOB_ATTEMPTS) {
      await markJobQueued(env, job, errorCode);
      message.retry({ delaySeconds: Math.min(120, 15 * job.attempt_count) });
    } else {
      await markJobFailed(env, job.id, job.organization_id, errorCode);
      message.ack();
    }
  }
}

async function recoverStaleJobs(env: Env): Promise<void> {
  const staleBefore = new Date(Date.now() - STALE_AFTER_MINUTES * 60_000).toISOString();
  const jobs = await env.DB.prepare(
    `SELECT id, media_file_id, organization_id, status, attempt_count
     FROM media_processing_jobs
     WHERE (status = 'queued' AND (last_enqueued_at IS NULL OR last_enqueued_at < ?))
        OR (status = 'processing' AND processing_started_at < ?)
     ORDER BY updated_at LIMIT 100`,
  ).bind(staleBefore, staleBefore).all<JobRow>();

  for (const job of jobs.results) {
    if (job.attempt_count >= MAX_JOB_ATTEMPTS) {
      await markJobFailed(env, job.id, job.organization_id, "PROCESSING_ATTEMPTS_EXHAUSTED");
      continue;
    }
    const now = new Date().toISOString();
    await env.DB.prepare(
      `UPDATE media_processing_jobs
       SET status = 'queued', last_enqueued_at = ?, processing_started_at = NULL,
           error_code = 'STALE_JOB_RECOVERED', updated_at = ?
       WHERE id = ? AND organization_id = ? AND status = ?`,
    ).bind(now, now, job.id, job.organization_id, job.status).run();
    await env.MEDIA_PROCESSING_QUEUE.send({
      jobId: job.id,
      mediaId: job.media_file_id,
      organizationId: job.organization_id,
    });
  }
}

export default {
  async queue(batch: MessageBatch<MediaProcessingQueueMessage>, env: Env) {
    for (const message of batch.messages) await processMessage(env, message);
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    await recoverStaleJobs(env);
  },
} satisfies ExportedHandler<Env, MediaProcessingQueueMessage>;

export { recoverStaleJobs };
