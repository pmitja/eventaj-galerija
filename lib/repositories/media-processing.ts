export type MediaProcessingJobStatus = "queued" | "processing" | "completed" | "failed";

export type MediaProcessingJob = {
  id: string;
  media_file_id: string;
  organization_id: string;
  status: MediaProcessingJobStatus;
  attempt_count: number;
  error_code: string | null;
  last_enqueued_at: string | null;
  processing_started_at: string | null;
  updated_at: string;
};

export async function createMediaProcessingJob(
  db: D1Database,
  input: { mediaId: string; organizationId: string },
): Promise<MediaProcessingJob | null> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const results = await db.batch([
    db.prepare(
      `INSERT INTO media_processing_jobs
        (id, media_file_id, organization_id, status, attempt_count, created_at, updated_at)
       SELECT ?, m.id, e.organization_id, 'queued', 0, ?, ?
       FROM media_files m JOIN events e ON e.id = m.event_id
       WHERE m.id = ? AND m.status = 'pending' AND e.organization_id = ?
       ON CONFLICT(media_file_id) DO UPDATE SET
         status = 'queued', attempt_count = 0, error_code = NULL,
         last_enqueued_at = NULL, processing_started_at = NULL,
         updated_at = excluded.updated_at, completed_at = NULL
       WHERE media_processing_jobs.status = 'failed'`,
    ).bind(id, now, now, input.mediaId, input.organizationId),
    db.prepare(
      `UPDATE media_files SET status = 'processing'
       WHERE id = ? AND status = 'pending' AND EXISTS (
         SELECT 1 FROM events e WHERE e.id = media_files.event_id AND e.organization_id = ?
       )`,
    ).bind(input.mediaId, input.organizationId),
  ]);
  if (results[0]?.meta.changes !== 1 && results[1]?.meta.changes !== 1) return null;
  return db.prepare(
    `SELECT id, media_file_id, organization_id, status, attempt_count, error_code,
            last_enqueued_at, processing_started_at, updated_at
     FROM media_processing_jobs WHERE media_file_id = ? AND organization_id = ?`,
  ).bind(input.mediaId, input.organizationId).first<MediaProcessingJob>();
}

export async function markMediaProcessingEnqueued(
  db: D1Database,
  jobId: string,
  organizationId: string,
): Promise<void> {
  await db.prepare(
    `UPDATE media_processing_jobs SET last_enqueued_at = ?, error_code = NULL, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = 'queued'`,
  ).bind(new Date().toISOString(), new Date().toISOString(), jobId, organizationId).run();
}

export async function markMediaProcessingEnqueueFailed(
  db: D1Database,
  jobId: string,
  organizationId: string,
): Promise<void> {
  await db.prepare(
    `UPDATE media_processing_jobs SET error_code = 'ENQUEUE_FAILED', updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = 'queued'`,
  ).bind(new Date().toISOString(), jobId, organizationId).run();
}

export async function retryFailedMediaProcessingJob(
  db: D1Database,
  input: { eventId: string; mediaId: string; organizationId: string },
): Promise<MediaProcessingJob | null> {
  const job = await db.prepare(
    `SELECT j.id, j.media_file_id, j.organization_id, j.status, j.attempt_count,
            j.error_code, j.last_enqueued_at, j.processing_started_at, j.updated_at
     FROM media_processing_jobs j
     JOIN media_files m ON m.id = j.media_file_id
     JOIN events e ON e.id = m.event_id
     WHERE j.media_file_id = ? AND m.event_id = ? AND j.organization_id = ?
       AND e.organization_id = ? AND j.status = 'failed'`,
  ).bind(input.mediaId, input.eventId, input.organizationId, input.organizationId).first<MediaProcessingJob>();
  if (!job) return null;
  const result = await db.prepare(
    `UPDATE media_processing_jobs
     SET status = 'queued', attempt_count = 0, error_code = NULL,
         last_enqueued_at = NULL, processing_started_at = NULL,
         completed_at = NULL, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = 'failed'`,
  ).bind(new Date().toISOString(), job.id, input.organizationId).run();
  return result.meta.changes === 1 ? { ...job, status: "queued", attempt_count: 0 } : null;
}
