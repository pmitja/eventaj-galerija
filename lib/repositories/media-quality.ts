import {
  PERCEPTUAL_DUPLICATE_MAX_DISTANCE,
  perceptualHashDistance,
  type QualityCategory,
  type TechnicalQualityMetrics,
} from "@/lib/domain/media-quality";

type EarlierFingerprint = {
  id: string;
  perceptual_hash: string;
};

type LaterFingerprint = EarlierFingerprint & {
  checksum_sha256: string;
};

export type DuplicateMatch = {
  mediaId: string;
  kind: "checksum" | "perceptual";
  distance: number;
};

type AnalysisInput = {
  organizationId: string;
  eventId: string;
  mediaId: string;
  checksumSha256: string;
  perceptualHash: string;
  width: number;
  height: number;
  createdAt: string;
  metrics: TechnicalQualityMetrics;
  category: QualityCategory;
  duplicate: DuplicateMatch | null;
  modelVersion: string;
};

export async function findEarlierDuplicate(input: {
  organizationId: string;
  eventId: string;
  mediaId: string;
  checksumSha256: string;
  perceptualHash: string;
  createdAt: string;
}, database: D1Database): Promise<DuplicateMatch | null> {
  const DB = database;
  const earlierClause = "(m.created_at < ? OR (m.created_at = ? AND m.id < ?))";
  const exact = await DB.prepare(
    `SELECT m.id FROM media_files m
     JOIN events e ON e.id = m.event_id
     WHERE e.organization_id = ? AND m.event_id = ? AND m.status != 'rejected'
       AND m.checksum_sha256 = ? AND ${earlierClause}
     ORDER BY m.created_at ASC, m.id ASC LIMIT 1`,
  ).bind(
    input.organizationId,
    input.eventId,
    input.checksumSha256,
    input.createdAt,
    input.createdAt,
    input.mediaId,
  ).first<{ id: string }>();
  if (exact) return { mediaId: exact.id, kind: "checksum", distance: 0 };

  const candidates = await DB.prepare(
    `SELECT m.id, m.perceptual_hash FROM media_files m
     JOIN events e ON e.id = m.event_id
     WHERE e.organization_id = ? AND m.event_id = ? AND m.status != 'rejected'
       AND m.perceptual_hash IS NOT NULL AND ${earlierClause}
     ORDER BY m.created_at ASC, m.id ASC LIMIT 5000`,
  ).bind(
    input.organizationId,
    input.eventId,
    input.createdAt,
    input.createdAt,
    input.mediaId,
  ).all<EarlierFingerprint>();

  let closest: DuplicateMatch | null = null;
  for (const candidate of candidates.results) {
    const distance = perceptualHashDistance(input.perceptualHash, candidate.perceptual_hash);
    if (distance <= PERCEPTUAL_DUPLICATE_MAX_DISTANCE && (!closest || distance < closest.distance)) {
      closest = { mediaId: candidate.id, kind: "perceptual", distance };
    }
  }
  return closest;
}

export async function saveTechnicalAnalysis(input: AnalysisInput, database: D1Database): Promise<void> {
  const DB = database;
  const now = new Date().toISOString();
  const updated = await DB.prepare(
    `UPDATE media_files
     SET checksum_sha256 = ?, perceptual_hash = ?, width = ?, height = ?,
         quality_category = ?, technical_score = ?, duplicate_of_media_id = ?
     WHERE id = ? AND event_id = ? AND EXISTS (
       SELECT 1 FROM events e WHERE e.id = media_files.event_id AND e.organization_id = ?
     )`,
  ).bind(
    input.checksumSha256,
    input.perceptualHash,
    input.width,
    input.height,
    input.category,
    Math.round(input.metrics.overall * 100),
    input.duplicate?.mediaId ?? null,
    input.mediaId,
    input.eventId,
    input.organizationId,
  ).run();
  if (updated.meta.changes !== 1) throw new Error("Media tenant scope changed during analysis");

  await DB.prepare(
    `INSERT INTO ai_analyses
       (id, media_file_id, analysis_type, provider, model_version, status,
        scores_json, labels_json, error_code, created_at, updated_at)
     VALUES (?, ?, 'technical_quality', 'eventaj', ?, 'completed', ?, ?, NULL, ?, ?)
     ON CONFLICT(media_file_id, analysis_type, provider, model_version) DO UPDATE SET
       status = excluded.status, scores_json = excluded.scores_json,
       labels_json = excluded.labels_json, error_code = NULL, updated_at = excluded.updated_at`,
  ).bind(
    crypto.randomUUID(),
    input.mediaId,
    input.modelVersion,
    JSON.stringify(input.metrics),
    JSON.stringify({
      category: input.category,
      duplicateKind: input.duplicate?.kind ?? null,
      duplicateDistance: input.duplicate?.distance ?? null,
    }),
    now,
    now,
  ).run();
}

export async function reconcileLaterDuplicates(input: {
  organizationId: string;
  eventId: string;
  mediaId: string;
  canonicalMediaId: string;
  checksumSha256: string;
  perceptualHash: string;
  createdAt: string;
}, database: D1Database): Promise<void> {
  const DB = database;
  const laterClause = "(m.created_at > ? OR (m.created_at = ? AND m.id > ?))";
  const scopedLaterIds = `SELECT m.id FROM media_files m JOIN events e ON e.id = m.event_id
    WHERE e.organization_id = ? AND m.event_id = ? AND m.status != 'rejected'
      AND m.checksum_sha256 = ? AND ${laterClause}`;
  const now = new Date().toISOString();

  await DB.batch([
    DB.prepare(
      `UPDATE media_files SET quality_category = 'duplicate', duplicate_of_media_id = ?
       WHERE id IN (${scopedLaterIds})`,
    ).bind(
      input.canonicalMediaId,
      input.organizationId,
      input.eventId,
      input.checksumSha256,
      input.createdAt,
      input.createdAt,
      input.mediaId,
    ),
    DB.prepare(
      `UPDATE ai_analyses
       SET labels_json = json_set(COALESCE(labels_json, '{}'),
         '$.category', 'duplicate', '$.duplicateKind', 'checksum', '$.duplicateDistance', 0),
         updated_at = ?
       WHERE media_file_id IN (${scopedLaterIds}) AND analysis_type = 'technical_quality'`,
    ).bind(
      now,
      input.organizationId,
      input.eventId,
      input.checksumSha256,
      input.createdAt,
      input.createdAt,
      input.mediaId,
    ),
  ]);

  const later = await DB.prepare(
    `SELECT m.id, m.checksum_sha256, m.perceptual_hash FROM media_files m
     JOIN events e ON e.id = m.event_id
     WHERE e.organization_id = ? AND m.event_id = ? AND m.status != 'rejected'
       AND m.perceptual_hash IS NOT NULL AND m.checksum_sha256 != ? AND ${laterClause}
     ORDER BY m.created_at ASC, m.id ASC LIMIT 5000`,
  ).bind(
    input.organizationId,
    input.eventId,
    input.checksumSha256,
    input.createdAt,
    input.createdAt,
    input.mediaId,
  ).all<LaterFingerprint>();

  for (const candidate of later.results) {
    const distance = perceptualHashDistance(input.perceptualHash, candidate.perceptual_hash);
    if (distance > PERCEPTUAL_DUPLICATE_MAX_DISTANCE) continue;
    await DB.batch([
      DB.prepare(
        `UPDATE media_files SET quality_category = 'duplicate', duplicate_of_media_id = ?
         WHERE id = ? AND event_id = ? AND EXISTS (
           SELECT 1 FROM events e WHERE e.id = media_files.event_id AND e.organization_id = ?
         )`,
      ).bind(input.canonicalMediaId, candidate.id, input.eventId, input.organizationId),
      DB.prepare(
        `UPDATE ai_analyses
         SET labels_json = json_set(COALESCE(labels_json, '{}'),
           '$.category', 'duplicate', '$.duplicateKind', 'perceptual', '$.duplicateDistance', ?),
           updated_at = ?
         WHERE media_file_id = ? AND analysis_type = 'technical_quality'`,
      ).bind(distance, now, candidate.id),
    ]);
  }
}

export async function saveTechnicalAnalysisFailure(
  input: {
    organizationId: string;
    eventId: string;
    mediaId: string;
    modelVersion: string;
    errorCode: string;
  },
  database: D1Database,
): Promise<void> {
  const now = new Date().toISOString();
  await database.prepare(
    `INSERT INTO ai_analyses
       (id, media_file_id, analysis_type, provider, model_version, status,
        scores_json, labels_json, error_code, created_at, updated_at)
     SELECT ?, m.id, 'technical_quality', 'eventaj', ?, 'failed', NULL, NULL, ?, ?, ?
     FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE m.id = ? AND m.event_id = ? AND e.organization_id = ?
     ON CONFLICT(media_file_id, analysis_type, provider, model_version) DO UPDATE SET
       status = excluded.status, error_code = excluded.error_code, updated_at = excluded.updated_at`,
  ).bind(
    crypto.randomUUID(),
    input.modelVersion,
    input.errorCode,
    now,
    now,
    input.mediaId,
    input.eventId,
    input.organizationId,
  ).run();
}
