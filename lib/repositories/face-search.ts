import { getCloudflareEnv } from "@/lib/cloudflare";
import { faceSearchExpiresAt, type FaceSearchStatus } from "@/lib/domain/face-search";

export type FaceSearchSessionRow = {
  id: string;
  event_id: string;
  public_slug: string;
  organization_id: string;
  guest_id: string;
  consent_record_id: string;
  selfie_object_key: string | null;
  declared_mime: string;
  size_bytes: number;
  status: FaceSearchStatus;
  attempt_count: number;
  error_code: string | null;
  expires_at: string;
  completed_at: string | null;
};

export type FaceIndexJobRow = {
  id: string;
  media_file_id: string;
  organization_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  attempt_count: number;
};

export async function hasFaceCollectionsEntitlement(eventId: string): Promise<boolean> {
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT 1 AS enabled FROM event_entitlements
     WHERE event_id = ? AND feature_code = 'face_collections' AND value_json = 'true'`,
  ).bind(eventId).first<{ enabled: number }>();
  return Boolean(row?.enabled);
}

export async function countRecentFaceSearchSessions(eventId: string, guestId: string): Promise<number> {
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT COUNT(*) AS count FROM face_search_sessions
     WHERE event_id = ? AND guest_id = ? AND created_at >= ?`,
  ).bind(eventId, guestId, new Date(Date.now() - 60 * 60 * 1000).toISOString()).first<{ count: number }>();
  return row?.count ?? 0;
}

export async function createFaceSearchSession(input: {
  eventId: string;
  organizationId: string;
  guestId: string;
  tokenHash: string;
  objectKey: string;
  mime: "image/jpeg" | "image/png";
  sizeBytes: number;
  policyVersion: string;
}): Promise<FaceSearchSessionRow> {
  const { DB } = getCloudflareEnv();
  const sessionId = crypto.randomUUID();
  const consentId = crypto.randomUUID();
  const now = new Date().toISOString();
  const expiresAt = faceSearchExpiresAt(new Date(now));
  await DB.batch([
    DB.prepare(
      `INSERT INTO consent_records
        (id, event_id, subject_reference, purpose, policy_version, granted, granted_at, evidence_json, created_at)
       SELECT ?, e.id, ?, 'selfie_match_processing', ?, 1, ?, ?, ?
       FROM events e
       JOIN event_guests g ON g.event_id = e.id AND g.id = ?
       JOIN event_entitlements ee ON ee.event_id = e.id
       WHERE e.id = ? AND e.organization_id = ? AND e.status = 'active'
         AND ee.feature_code = 'face_collections' AND ee.value_json = 'true'`,
    ).bind(
      consentId, input.guestId, input.policyVersion, now,
      JSON.stringify({ channel: "event_page", explicit: true }), now,
      input.guestId, input.eventId, input.organizationId,
    ),
    DB.prepare(
      `INSERT INTO face_search_sessions
        (id, event_id, organization_id, guest_id, consent_record_id, token_hash,
         selfie_object_key, declared_mime, size_bytes, status, expires_at, created_at, updated_at)
       SELECT ?, e.id, e.organization_id, ?, ?, ?, ?, ?, ?, 'awaiting_upload', ?, ?, ?
       FROM events e
       JOIN event_guests g ON g.event_id = e.id AND g.id = ?
       JOIN event_entitlements ee ON ee.event_id = e.id
       WHERE e.id = ? AND e.organization_id = ? AND e.status = 'active'
         AND ee.feature_code = 'face_collections' AND ee.value_json = 'true'`,
    ).bind(
      sessionId, input.guestId, consentId, input.tokenHash, input.objectKey,
      input.mime, input.sizeBytes, expiresAt, now, now, input.guestId,
      input.eventId, input.organizationId,
    ),
    DB.prepare(
      `INSERT INTO audit_logs
        (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
       SELECT ?, ?, 'guest', ?, 'face_search.consent_granted', 'face_search_session', ?, ?, ?
       WHERE EXISTS (SELECT 1 FROM face_search_sessions WHERE id = ? AND organization_id = ?)`,
    ).bind(
      crypto.randomUUID(), input.eventId, input.guestId, sessionId,
      JSON.stringify({ purpose: "selfie_match_processing", policyVersion: input.policyVersion }), now,
      sessionId, input.organizationId,
    ),
  ]);
  const session = await DB.prepare(
    `SELECT s.id, s.event_id, e.public_slug, s.organization_id, s.guest_id, s.consent_record_id,
            s.selfie_object_key, s.declared_mime, s.size_bytes, s.status, s.attempt_count,
            s.error_code, s.expires_at, s.completed_at
     FROM face_search_sessions s JOIN events e ON e.id = s.event_id
     WHERE s.id = ? AND s.organization_id = ?`,
  ).bind(sessionId, input.organizationId).first<FaceSearchSessionRow>();
  if (!session) throw new Error("FACE_SEARCH_SESSION_NOT_CREATED");
  return session;
}

export async function hasCurrentGuestProbe(eventId: string, guestId: string): Promise<boolean> {
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT 1 AS present FROM face_guest_probes
     WHERE event_id = ? AND guest_id = ? AND expires_at > ?`,
  ).bind(eventId, guestId, new Date().toISOString()).first<{ present: number }>();
  return Boolean(row?.present);
}

// Creates a search session that reuses the guest's stored selfie face (probe)
// instead of a fresh upload. Returns null when no current probe exists so the
// caller can fall back to the selfie flow.
export async function createFaceReSearchSession(input: {
  eventId: string;
  organizationId: string;
  guestId: string;
  tokenHash: string;
}): Promise<FaceSearchSessionRow | null> {
  const { DB } = getCloudflareEnv();
  const now = new Date().toISOString();
  const probe = await DB.prepare(
    `SELECT consent_record_id FROM face_guest_probes
     WHERE event_id = ? AND guest_id = ? AND expires_at > ?
     ORDER BY updated_at DESC LIMIT 1`,
  ).bind(input.eventId, input.guestId, now).first<{ consent_record_id: string }>();
  if (!probe) return null;
  const sessionId = crypto.randomUUID();
  const expiresAt = faceSearchExpiresAt(new Date(now));
  await DB.batch([
    DB.prepare(
      `INSERT INTO face_search_sessions
        (id, event_id, organization_id, guest_id, consent_record_id, token_hash,
         selfie_object_key, declared_mime, size_bytes, status, expires_at, created_at, updated_at)
       SELECT ?, e.id, e.organization_id, ?, ?, ?, NULL, '', 0, 'queued', ?, ?, ?
       FROM events e
       JOIN event_guests g ON g.event_id = e.id AND g.id = ?
       JOIN event_entitlements ee ON ee.event_id = e.id
       WHERE e.id = ? AND e.organization_id = ? AND e.status IN ('active', 'ended')
         AND ee.feature_code = 'face_collections' AND ee.value_json = 'true'`,
    ).bind(
      sessionId, input.guestId, probe.consent_record_id, input.tokenHash,
      expiresAt, now, now, input.guestId, input.eventId, input.organizationId,
    ),
    DB.prepare(
      `INSERT INTO audit_logs
        (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
       SELECT ?, ?, 'guest', ?, 'face_search.re_search', 'face_search_session', ?, ?, ?
       WHERE EXISTS (SELECT 1 FROM face_search_sessions WHERE id = ? AND organization_id = ?)`,
    ).bind(
      crypto.randomUUID(), input.eventId, input.guestId, sessionId,
      JSON.stringify({ purpose: "selfie_match_processing", reused: true }), now,
      sessionId, input.organizationId,
    ),
  ]);
  return DB.prepare(
    `SELECT s.id, s.event_id, e.public_slug, s.organization_id, s.guest_id, s.consent_record_id,
            s.selfie_object_key, s.declared_mime, s.size_bytes, s.status, s.attempt_count,
            s.error_code, s.expires_at, s.completed_at
     FROM face_search_sessions s JOIN events e ON e.id = s.event_id
     WHERE s.id = ? AND s.organization_id = ?`,
  ).bind(sessionId, input.organizationId).first<FaceSearchSessionRow>();
}

export async function findFaceSearchSessionByTokenHash(tokenHash: string): Promise<FaceSearchSessionRow | null> {
  return getCloudflareEnv().DB.prepare(
    `SELECT s.id, s.event_id, e.public_slug, s.organization_id, s.guest_id, s.consent_record_id,
            s.selfie_object_key, s.declared_mime, s.size_bytes, s.status,
            s.attempt_count, s.error_code, s.expires_at, s.completed_at
     FROM face_search_sessions s
     JOIN events e ON e.id = s.event_id AND e.organization_id = s.organization_id
     WHERE s.token_hash = ?`,
  ).bind(tokenHash).first<FaceSearchSessionRow>();
}

export async function prepareFaceSearch(session: FaceSearchSessionRow): Promise<FaceIndexJobRow[]> {
  const { DB } = getCloudflareEnv();
  const now = new Date().toISOString();
  const update = await DB.prepare(
    `UPDATE face_search_sessions SET status = 'queued', error_code = NULL, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = 'awaiting_upload' AND expires_at > ?`,
  ).bind(now, session.id, session.organization_id, now).run();
  if (update.meta.changes !== 1 && session.status !== "queued" && session.status !== "searching") return [];
  await DB.prepare(
    `INSERT INTO face_index_jobs
      (id, media_file_id, organization_id, status, attempt_count, created_at, updated_at)
     SELECT lower(hex(randomblob(16))), m.id, e.organization_id, 'queued', 0, ?, ?
     FROM media_files m
     JOIN events e ON e.id = m.event_id
     JOIN event_entitlements ee ON ee.event_id = e.id
     WHERE m.event_id = ? AND e.organization_id = ? AND m.status = 'ready'
       AND ee.feature_code = 'face_collections' AND ee.value_json = 'true'
       AND NOT EXISTS (SELECT 1 FROM face_index_jobs j WHERE j.media_file_id = m.id)
     ON CONFLICT(media_file_id) DO NOTHING`,
  ).bind(now, now, session.event_id, session.organization_id).run();
  const jobs = await DB.prepare(
    `SELECT j.id, j.media_file_id, j.organization_id, j.status, j.attempt_count
     FROM face_index_jobs j
     JOIN media_files m ON m.id = j.media_file_id
     WHERE m.event_id = ? AND j.organization_id = ? AND j.status = 'queued'
     ORDER BY j.created_at`,
  ).bind(session.event_id, session.organization_id).all<FaceIndexJobRow>();
  return jobs.results;
}

export async function markFaceJobsEnqueued(jobIds: string[], organizationId: string): Promise<void> {
  if (jobIds.length === 0) return;
  const { DB } = getCloudflareEnv();
  const now = new Date().toISOString();
  await DB.batch(jobIds.map((id) => DB.prepare(
    `UPDATE face_index_jobs SET last_enqueued_at = ?, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = 'queued'`,
  ).bind(now, now, id, organizationId)));
}

export type FaceSearchPublicMatch = {
  public_id: string;
  original_filename: string;
  similarity: number;
  comment_count: number;
};

export async function listFaceSearchMatches(session: FaceSearchSessionRow): Promise<FaceSearchPublicMatch[]> {
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT m.public_id, m.original_filename, fsm.similarity,
       (SELECT COUNT(*) FROM media_comments c
        WHERE c.event_id = m.event_id AND c.media_id = m.id AND c.status = 'visible') AS comment_count
     FROM face_search_matches fsm
     JOIN media_files m ON m.id = fsm.media_file_id
     JOIN events e ON e.id = m.event_id
     WHERE fsm.session_id = ? AND m.event_id = ? AND e.organization_id = ?
       AND m.status = 'ready' AND m.gallery_state = 'visible' AND m.publication_consent = 1
       AND COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')
     ORDER BY fsm.similarity DESC, m.uploaded_at DESC`,
  ).bind(session.id, session.event_id, session.organization_id).all<FaceSearchPublicMatch>();
  return result.results;
}

export async function withdrawFaceSearchSession(session: FaceSearchSessionRow): Promise<void> {
  const { DB } = getCloudflareEnv();
  const now = new Date().toISOString();
  await DB.batch([
    DB.prepare(
      `UPDATE face_search_sessions
       SET status = 'withdrawn', selfie_object_key = NULL, error_code = NULL, completed_at = ?, updated_at = ?
       WHERE id = ? AND organization_id = ? AND status != 'withdrawn'`,
    ).bind(now, now, session.id, session.organization_id),
    DB.prepare("DELETE FROM face_search_matches WHERE session_id = ?").bind(session.id),
    // Mark the guest's stored selfie face as expired so the worker deletes it
    // from the provider collection on the next cleanup pass.
    DB.prepare(
      `UPDATE face_guest_probes SET expires_at = ?, updated_at = ?
       WHERE event_id = ? AND guest_id = ?`,
    ).bind(now, now, session.event_id, session.guest_id),
    DB.prepare(
      `UPDATE consent_records SET granted = 0, withdrawn_at = ?
       WHERE id = ? AND event_id = ? AND purpose = 'selfie_match_processing'`,
    ).bind(now, session.consent_record_id, session.event_id),
    DB.prepare(
      `INSERT INTO audit_logs
        (id, event_id, actor_type, actor_id, action, target_type, target_id, created_at)
       VALUES (?, ?, 'guest', ?, 'face_search.consent_withdrawn', 'face_search_session', ?, ?)`,
    ).bind(crypto.randomUUID(), session.event_id, session.guest_id, session.id, now),
  ]);
}
