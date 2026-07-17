import { getCloudflareEnv } from "@/lib/cloudflare";
import { TECHNICAL_QUALITY_MODEL_VERSION, type QualityCategory } from "@/lib/domain/media-quality";

export async function requestTechnicalAnalysis(input: {
  organizationId: string;
  eventId: string;
  mediaId: string;
}): Promise<"queued" | "already_pending" | "not_found"> {
  const { DB } = getCloudflareEnv();
  const media = await DB.prepare(
    `SELECT m.id FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE m.id = ? AND m.event_id = ? AND m.status = 'ready' AND e.organization_id = ?`,
  ).bind(input.mediaId, input.eventId, input.organizationId).first<{ id: string }>();
  if (!media) return "not_found";

  const now = new Date().toISOString();
  const inserted = await DB.prepare(
    `INSERT OR IGNORE INTO ai_analyses
       (id, media_file_id, analysis_type, provider, model_version, status, created_at, updated_at)
     VALUES (?, ?, 'technical_quality', 'eventaj', ?, 'pending', ?, ?)`,
  ).bind(crypto.randomUUID(), input.mediaId, TECHNICAL_QUALITY_MODEL_VERSION, now, now).run();
  if (inserted.meta.changes === 1) return "queued";

  const updated = await DB.prepare(
    `UPDATE ai_analyses SET status = 'pending', error_code = NULL, updated_at = ?
     WHERE media_file_id = ? AND analysis_type = 'technical_quality' AND provider = 'eventaj'
       AND model_version = ? AND status != 'pending'`,
  ).bind(now, input.mediaId, TECHNICAL_QUALITY_MODEL_VERSION).run();
  return updated.meta.changes === 1 ? "queued" : "already_pending";
}

export async function setMediaQualityOverride(input: {
  organizationId: string;
  eventId: string;
  mediaId: string;
  category: QualityCategory | null;
  actorId: string;
}): Promise<{ automatic: QualityCategory | null; effective: QualityCategory | null } | null> {
  const { DB } = getCloudflareEnv();
  const now = new Date().toISOString();
  const result = await DB.prepare(
    `UPDATE media_files
     SET quality_override = ?, quality_override_by = ?, quality_override_at = ?
     WHERE id = ? AND event_id = ? AND status = 'ready' AND EXISTS (
       SELECT 1 FROM events e WHERE e.id = media_files.event_id AND e.organization_id = ?
     )`,
  ).bind(
    input.category,
    input.category === null ? null : input.actorId,
    input.category === null ? null : now,
    input.mediaId,
    input.eventId,
    input.organizationId,
  ).run();
  if (result.meta.changes !== 1) return null;
  const row = await DB.prepare(
    `SELECT quality_category AS automatic,
            COALESCE(quality_override, quality_category) AS effective
     FROM media_files WHERE id = ? AND event_id = ?`,
  ).bind(input.mediaId, input.eventId).first<{
    automatic: QualityCategory | null;
    effective: QualityCategory | null;
  }>();
  return row ?? { automatic: null, effective: input.category };
}
