import { getCloudflareEnv } from "@/lib/cloudflare";
import { TECHNICAL_QUALITY_MODEL_VERSION } from "@/lib/domain/media-quality";
import type { z } from "zod";
import type { qualityBackfillModeSchema } from "@/lib/validation/quality-backfill";

export type QualityBackfillMode = z.infer<typeof qualityBackfillModeSchema>;
export type QualityBackfillStatus = "queued" | "processing" | "completed" | "failed";

export type QualityBackfillSummary = {
  id: string;
  event_id: string;
  mode: QualityBackfillMode;
  model_version: string;
  status: QualityBackfillStatus;
  error_code: string | null;
  total_count: number;
  completed_count: number;
  failed_count: number;
  queued_count: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const summarySelect = `SELECT qb.id, qb.event_id, qb.mode, qb.model_version, qb.status,
  qb.error_code, qb.created_at, qb.updated_at, qb.completed_at,
  COUNT(qbi.media_file_id) AS total_count,
  COALESCE(SUM(CASE WHEN qbi.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_count,
  COALESCE(SUM(CASE WHEN qbi.status = 'failed' THEN 1 ELSE 0 END), 0) AS failed_count,
  COALESCE(SUM(CASE WHEN qbi.status = 'queued' THEN 1 ELSE 0 END), 0) AS queued_count
 FROM quality_backfills qb
 JOIN events e ON e.id = qb.event_id
 LEFT JOIN quality_backfill_items qbi ON qbi.backfill_id = qb.id`;

export async function findLatestOwnedQualityBackfill(eventId: string, organizationId: string): Promise<QualityBackfillSummary | null> {
  const { DB } = getCloudflareEnv();
  return DB.prepare(
    `${summarySelect}
     WHERE qb.event_id = ? AND e.organization_id = ?
     GROUP BY qb.id ORDER BY qb.created_at DESC LIMIT 1`,
  ).bind(eventId, organizationId).first<QualityBackfillSummary>();
}

export async function createQualityBackfill(input: {
  eventId: string;
  requestedBy: string;
  mode: QualityBackfillMode;
  organizationId: string;
}): Promise<{ job: QualityBackfillSummary; created: boolean }> {
  const existing = await findLatestOwnedQualityBackfill(input.eventId, input.organizationId);
  if (existing && (existing.status === "queued" || existing.status === "processing")) {
    return { job: existing, created: false };
  }

  const { DB } = getCloudflareEnv();
  const owned = await DB.prepare("SELECT id FROM events WHERE id = ? AND organization_id = ?")
    .bind(input.eventId, input.organizationId).first<{ id: string }>();
  if (!owned) throw new Error("EVENT_NOT_FOUND");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    await DB.prepare(
      `INSERT INTO quality_backfills
        (id, event_id, requested_by, mode, model_version, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'queued', ?, ?)`,
    ).bind(id, input.eventId, input.requestedBy, input.mode, TECHNICAL_QUALITY_MODEL_VERSION, now, now).run();
  } catch (error) {
    const concurrent = await findLatestOwnedQualityBackfill(input.eventId, input.organizationId);
    if (concurrent && (concurrent.status === "queued" || concurrent.status === "processing")) {
      return { job: concurrent, created: false };
    }
    throw error;
  }
  const job = await findLatestOwnedQualityBackfill(input.eventId, input.organizationId);
  if (!job) throw new Error("QUALITY_BACKFILL_CREATE_FAILED");
  return { job, created: true };
}

export async function markQualityBackfillEnqueueFailed(backfillId: string): Promise<void> {
  await getCloudflareEnv().DB.prepare(
    `UPDATE quality_backfills SET status = 'failed', error_code = 'QUEUE_UNAVAILABLE', updated_at = ?
     WHERE id = ? AND status = 'queued'`,
  ).bind(new Date().toISOString(), backfillId).run();
}
