import { processTechnicalAnalysis, type TechnicalAnalysisRuntime } from "../lib/storage/technical-analysis";
import {
  qualityBackfillQueueMessageSchema,
  type QualityBackfillQueueMessage,
} from "../lib/validation/quality-backfill";

interface Env extends TechnicalAnalysisRuntime {
  QUALITY_QUEUE: Queue<QualityBackfillQueueMessage>;
}

type BackfillRow = {
  id: string;
  event_id: string;
  mode: "missing" | "failed" | "all";
  model_version: string;
  status: "queued" | "processing" | "completed" | "failed";
  fanout_completed_at: string | null;
};

type MediaRow = { id: string };
type ItemRow = { status: "queued" | "completed" | "failed" };

export function chunkItems<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function findBackfill(env: Env, backfillId: string, organizationId: string): Promise<BackfillRow | null> {
  return env.DB.prepare(
    `SELECT qb.id, qb.event_id, qb.mode, qb.model_version, qb.status, qb.fanout_completed_at
     FROM quality_backfills qb JOIN events e ON e.id = qb.event_id
     WHERE qb.id = ? AND e.organization_id = ?`,
  ).bind(backfillId, organizationId).first<BackfillRow>();
}

async function finalizeBackfill(env: Env, backfillId: string): Promise<void> {
  const counts = await env.DB.prepare(
    `SELECT COUNT(*) AS total,
      SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) AS queued,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed
     FROM quality_backfill_items WHERE backfill_id = ?`,
  ).bind(backfillId).first<{ total: number; queued: number; failed: number }>();
  if (!counts || counts.queued > 0) return;
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE quality_backfills
     SET status = ?, error_code = ?, completed_at = ?, updated_at = ?
     WHERE id = ? AND status = 'processing' AND fanout_completed_at IS NOT NULL`,
  ).bind(counts.failed > 0 ? "failed" : "completed", counts.failed > 0 ? "PARTIAL_FAILURE" : null, now, now, backfillId).run();
}

async function fanOutBackfill(env: Env, job: BackfillRow, organizationId: string): Promise<void> {
  if (job.status === "completed" || job.status === "failed" || job.fanout_completed_at) return;
  await env.DB.prepare(
    "UPDATE quality_backfills SET status = 'processing', error_code = NULL, updated_at = ? WHERE id = ? AND status IN ('queued', 'processing')",
  ).bind(new Date().toISOString(), job.id).run();

  const modeCondition = job.mode === "missing"
    ? "a.media_file_id IS NULL"
    : job.mode === "failed"
      ? "a.status = 'failed'"
      : "1 = 1";
  const media = await env.DB.prepare(
    `SELECT m.id FROM media_files m
     JOIN events e ON e.id = m.event_id
     LEFT JOIN ai_analyses a ON a.media_file_id = m.id
       AND a.analysis_type = 'technical_quality' AND a.provider = 'eventaj' AND a.model_version = ?
     WHERE m.event_id = ? AND m.status = 'ready' AND e.organization_id = ? AND ${modeCondition}
     ORDER BY m.created_at, m.id`,
  ).bind(job.model_version, job.event_id, organizationId).all<MediaRow>();

  for (const group of chunkItems(media.results, 100)) {
    const now = new Date().toISOString();
    await env.DB.batch(group.map((item) => env.DB.prepare(
      `INSERT OR IGNORE INTO quality_backfill_items
        (backfill_id, media_file_id, status, attempt_count, updated_at)
       VALUES (?, ?, 'queued', 0, ?)`,
    ).bind(job.id, item.id, now)));
    await env.QUALITY_QUEUE.sendBatch(group.map((item) => ({
      body: { type: "media" as const, backfillId: job.id, mediaId: item.id, organizationId },
      contentType: "json" as const,
    })));
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    "UPDATE quality_backfills SET fanout_completed_at = ?, updated_at = ? WHERE id = ? AND status = 'processing'",
  ).bind(now, now, job.id).run();
  await finalizeBackfill(env, job.id);
}

async function processBackfillMedia(
  env: Env,
  input: Extract<QualityBackfillQueueMessage, { type: "media" }>,
  finalAttempt: boolean,
): Promise<"completed" | "retry" | "failed" | "ignored"> {
  const item = await env.DB.prepare(
    `SELECT qbi.status FROM quality_backfill_items qbi
     JOIN quality_backfills qb ON qb.id = qbi.backfill_id
     JOIN events e ON e.id = qb.event_id
     WHERE qbi.backfill_id = ? AND qbi.media_file_id = ? AND e.organization_id = ?`,
  ).bind(input.backfillId, input.mediaId, input.organizationId).first<ItemRow>();
  if (!item || item.status === "completed") return "ignored";

  const result = await processTechnicalAnalysis(input.mediaId, input.organizationId, env);
  const now = new Date().toISOString();
  const completed = result === "completed";
  const permanentFailure = result === "not_found" || finalAttempt;
  await env.DB.prepare(
    `UPDATE quality_backfill_items
     SET status = ?, attempt_count = attempt_count + 1, error_code = ?, updated_at = ?
     WHERE backfill_id = ? AND media_file_id = ? AND status != 'completed'`,
  ).bind(
    completed ? "completed" : permanentFailure ? "failed" : "queued",
    result === "not_found" ? "MEDIA_NOT_FOUND" : completed ? null : "TECHNICAL_ANALYSIS_FAILED",
    now,
    input.backfillId,
    input.mediaId,
  ).run();
  await finalizeBackfill(env, input.backfillId);
  return completed ? "completed" : permanentFailure ? "failed" : "retry";
}

async function markBackfillFailed(env: Env, backfillId: string, errorCode: string): Promise<void> {
  await env.DB.prepare(
    "UPDATE quality_backfills SET status = 'failed', error_code = ?, completed_at = ?, updated_at = ? WHERE id = ? AND status IN ('queued', 'processing')",
  ).bind(errorCode, new Date().toISOString(), new Date().toISOString(), backfillId).run();
}

export default {
  async queue(batch: MessageBatch<QualityBackfillQueueMessage>, env: Env) {
    for (const message of batch.messages) {
      const parsed = qualityBackfillQueueMessageSchema.safeParse(message.body);
      if (!parsed.success) {
        console.error(JSON.stringify({ event: "quality_backfill.invalid_message", messageId: message.id }));
        message.ack();
        continue;
      }
      try {
        if (parsed.data.type === "start") {
          const job = await findBackfill(env, parsed.data.backfillId, parsed.data.organizationId);
          if (job) await fanOutBackfill(env, job, parsed.data.organizationId);
          message.ack();
          continue;
        }
        const result = await processBackfillMedia(env, parsed.data, message.attempts >= 3);
        if (result === "retry") {
          message.retry({ delaySeconds: 30 * message.attempts });
        } else {
          message.ack();
        }
      } catch {
        console.error(JSON.stringify({
          event: "quality_backfill.message_failed",
          messageId: message.id,
          type: parsed.data.type,
          attempt: message.attempts,
        }));
        if (message.attempts < 3) message.retry({ delaySeconds: 30 * message.attempts });
        else {
          await markBackfillFailed(env, parsed.data.backfillId, "BACKFILL_WORKER_FAILED");
          message.ack();
        }
      }
    }
  },
} satisfies ExportedHandler<Env, QualityBackfillQueueMessage>;
