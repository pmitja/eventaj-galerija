import {
  faceCollectionId,
  faceEmbeddingExpiresAt,
  faceProbeExpiresAt,
  FACE_SEARCH_DEFAULT_THRESHOLD,
} from "../lib/domain/face-search";
import {
  FaceProviderError,
  RekognitionFaceProvider,
  type FaceProvider,
} from "../lib/ai/face-provider";
import { faceQueueMessageSchema, type FaceQueueMessage } from "../lib/validation/face-search";

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  IMAGES: ImagesBinding;
  FACE_PROCESSING_QUEUE: Queue<FaceQueueMessage>;
  AWS_REKOGNITION_ACCESS_KEY_ID: string;
  AWS_REKOGNITION_SECRET_ACCESS_KEY: string;
  AWS_REKOGNITION_REGION: string;
  FACE_MATCH_THRESHOLD: string;
  FACE_SEARCH_ENABLED: string;
}

type IndexJob = {
  id: string;
  media_file_id: string;
  organization_id: string;
  event_id: string;
  object_key: string;
  retention_until: string;
  status: "queued" | "processing" | "completed" | "failed";
  attempt_count: number;
};

type SearchSession = {
  id: string;
  event_id: string;
  organization_id: string;
  guest_id: string;
  consent_record_id: string;
  selfie_object_key: string | null;
  retention_until: string;
  status: "queued" | "searching";
  attempt_count: number;
  expires_at: string;
};

const MAX_ATTEMPTS = 5;
const STALE_BEFORE_MS = 2 * 60 * 1000;

function provider(env: Env): FaceProvider {
  return new RekognitionFaceProvider(env);
}

function errorCode(error: unknown): string {
  if (error instanceof FaceProviderError) return error.code.replace(/[^A-Z0-9_]/gi, "_").toUpperCase();
  if (error instanceof Error && /^[A-Z][A-Z0-9_]+$/.test(error.message)) return error.message;
  return "FACE_PROCESSING_FAILED";
}

async function analysisJpeg(env: Env, objectKey: string): Promise<Uint8Array> {
  const original = await env.MEDIA.get(objectKey);
  if (!original?.body) throw new Error("MEDIA_NOT_FOUND");
  const output = await env.IMAGES.input(original.body)
    .transform({ width: 1920, fit: "scale-down" })
    .output({ format: "image/jpeg", quality: 85 });
  const response = output.response();
  if (!response.ok) throw new Error("FACE_TRANSFORM_FAILED");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("FACE_IMAGE_TOO_LARGE");
  return bytes;
}

async function claimIndexJob(env: Env, input: Extract<FaceQueueMessage, { kind: "index" }>): Promise<IndexJob | null> {
  const job = await env.DB.prepare(
    `SELECT j.id, j.media_file_id, j.organization_id, j.status, j.attempt_count,
            m.event_id, m.object_key, e.retention_until
     FROM face_index_jobs j
     JOIN media_files m ON m.id = j.media_file_id
     JOIN events e ON e.id = m.event_id AND e.organization_id = j.organization_id
     JOIN event_entitlements ee ON ee.event_id = e.id
     WHERE j.id = ? AND j.media_file_id = ? AND j.organization_id = ?
       AND m.status = 'ready' AND ee.feature_code = 'face_collections' AND ee.value_json = 'true'`,
  ).bind(input.jobId, input.mediaId, input.organizationId).first<IndexJob>();
  if (!job || job.status === "completed" || job.status === "failed" || job.attempt_count >= MAX_ATTEMPTS) return null;
  const result = await env.DB.prepare(
    `UPDATE face_index_jobs
     SET status = 'processing', attempt_count = attempt_count + 1,
         processing_started_at = ?, error_code = NULL, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = ?`,
  ).bind(new Date().toISOString(), new Date().toISOString(), job.id, job.organization_id, job.status).run();
  return result.meta.changes === 1 ? { ...job, status: "processing", attempt_count: job.attempt_count + 1 } : null;
}

async function processIndex(env: Env, message: Message<FaceQueueMessage>, input: Extract<FaceQueueMessage, { kind: "index" }>) {
  const job = await claimIndexJob(env, input);
  if (!job) {
    message.ack();
    return;
  }
  try {
    const bytes = await analysisJpeg(env, job.object_key);
    const faceProvider = provider(env);
    const faces = await faceProvider.indexFaces(faceCollectionId(job.event_id), job.media_file_id, bytes);
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare(
        `DELETE FROM face_provider_faces
         WHERE media_file_id = ? AND event_id = ? AND provider = ?`,
      ).bind(job.media_file_id, job.event_id, faceProvider.name),
      ...faces.map((face) => env.DB.prepare(
        `INSERT INTO face_provider_faces
          (id, event_id, media_file_id, provider, provider_face_id, model_version,
           confidence, bounding_box_json, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        crypto.randomUUID(), job.event_id, job.media_file_id, faceProvider.name,
        face.providerFaceId, face.modelVersion, face.confidence,
        JSON.stringify(face.boundingBox), faceEmbeddingExpiresAt(job.retention_until, new Date(now)), now,
      )),
      env.DB.prepare(
        `UPDATE face_index_jobs SET status = 'completed', error_code = NULL,
         completed_at = ?, updated_at = ? WHERE id = ? AND organization_id = ? AND status = 'processing'`,
      ).bind(now, now, job.id, job.organization_id),
    ]);
    message.ack();
  } catch (error) {
    const code = errorCode(error);
    const retryable = !(error instanceof FaceProviderError) || error.retryable;
    if (retryable && job.attempt_count < MAX_ATTEMPTS) {
      await env.DB.prepare(
        `UPDATE face_index_jobs SET status = 'queued', error_code = ?, processing_started_at = NULL, updated_at = ?
         WHERE id = ? AND organization_id = ? AND status = 'processing'`,
      ).bind(code, new Date().toISOString(), job.id, job.organization_id).run();
      message.retry({ delaySeconds: Math.min(120, 15 * job.attempt_count) });
    } else {
      await env.DB.prepare(
        `UPDATE face_index_jobs SET status = 'failed', error_code = ?, completed_at = ?, updated_at = ?
         WHERE id = ? AND organization_id = ?`,
      ).bind(code, new Date().toISOString(), new Date().toISOString(), job.id, job.organization_id).run();
      message.ack();
    }
    console.error(JSON.stringify({ event: "face_index.failed", jobId: job.id, mediaId: job.media_file_id, errorCode: code }));
  }
}

async function claimSearch(env: Env, input: Extract<FaceQueueMessage, { kind: "search" }>): Promise<SearchSession | null> {
  const session = await env.DB.prepare(
    `SELECT s.id, s.event_id, s.organization_id, s.guest_id, s.consent_record_id,
            s.selfie_object_key, e.retention_until, s.status, s.attempt_count, s.expires_at
     FROM face_search_sessions s
     JOIN events e ON e.id = s.event_id AND e.organization_id = s.organization_id
     JOIN event_entitlements ee ON ee.event_id = e.id
     WHERE s.id = ? AND s.organization_id = ? AND s.status IN ('queued', 'searching')
       AND s.expires_at > ? AND ee.feature_code = 'face_collections' AND ee.value_json = 'true'`,
  ).bind(input.sessionId, input.organizationId, new Date().toISOString()).first<SearchSession>();
  if (!session) return null;
  const result = await env.DB.prepare(
    `UPDATE face_search_sessions SET status = 'searching', attempt_count = attempt_count + 1, updated_at = ?
     WHERE id = ? AND organization_id = ? AND status = ?`,
  ).bind(new Date().toISOString(), session.id, session.organization_id, session.status).run();
  return result.meta.changes === 1 ? { ...session, status: "searching", attempt_count: session.attempt_count + 1 } : null;
}

async function finishSearch(env: Env, session: SearchSession, status: "completed" | "failed", code: string | null) {
  const now = new Date().toISOString();
  if (session.selfie_object_key) await env.MEDIA.delete(session.selfie_object_key);
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE face_search_sessions
       SET status = ?, error_code = ?, selfie_object_key = NULL, completed_at = ?, updated_at = ?
       WHERE id = ? AND organization_id = ? AND status = 'searching'`,
    ).bind(status, code, now, now, session.id, session.organization_id),
    env.DB.prepare(
      `INSERT INTO audit_logs
        (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
       SELECT ?, ?, 'guest', ?, ?, 'face_search_session', ?, ?, ?
       WHERE EXISTS (
         SELECT 1 FROM face_search_sessions
         WHERE id = ? AND organization_id = ? AND status = ?
       )`,
    ).bind(
      crypto.randomUUID(), session.event_id, session.guest_id,
      status === "completed" ? "face_search.completed" : "face_search.failed",
      session.id, JSON.stringify(code ? { errorCode: code } : {}), now,
      session.id, session.organization_id, status,
    ),
  ]);
}

async function guestProbeFaceId(env: Env, session: SearchSession, providerName: string): Promise<string | null> {
  const probe = await env.DB.prepare(
    `SELECT provider_face_id FROM face_guest_probes
     WHERE event_id = ? AND guest_id = ? AND provider = ? AND expires_at > ?`,
  ).bind(session.event_id, session.guest_id, providerName, new Date().toISOString())
    .first<{ provider_face_id: string }>();
  return probe?.provider_face_id ?? null;
}

// Persist the guest's own selfie face so a later "Osveži" can search without a
// new selfie. Best effort: a failure here never fails the search itself.
async function rememberGuestProbe(env: Env, session: SearchSession, faceProvider: FaceProvider, bytes: Uint8Array): Promise<void> {
  try {
    const indexed = await faceProvider.indexProbeFace(
      faceCollectionId(session.event_id), `guest:${session.guest_id}`, bytes,
    );
    if (!indexed) return;
    const prior = await env.DB.prepare(
      `SELECT provider_face_id FROM face_guest_probes
       WHERE event_id = ? AND guest_id = ? AND provider = ?`,
    ).bind(session.event_id, session.guest_id, faceProvider.name).first<{ provider_face_id: string }>();
    if (prior && prior.provider_face_id !== indexed.providerFaceId) {
      await faceProvider.deleteFaces(faceCollectionId(session.event_id), [prior.provider_face_id]);
    }
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO face_guest_probes
        (id, event_id, guest_id, consent_record_id, provider, provider_face_id,
         model_version, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(event_id, guest_id, provider) DO UPDATE SET
         consent_record_id = excluded.consent_record_id,
         provider_face_id = excluded.provider_face_id,
         model_version = excluded.model_version,
         expires_at = excluded.expires_at,
         updated_at = excluded.updated_at`,
    ).bind(
      crypto.randomUUID(), session.event_id, session.guest_id, session.consent_record_id,
      faceProvider.name, indexed.providerFaceId, indexed.modelVersion,
      faceProbeExpiresAt(session.retention_until, new Date(now)), now, now,
    ).run();
  } catch (error) {
    console.error(JSON.stringify({
      event: "face_search.probe_index_failed", sessionId: session.id, errorCode: errorCode(error),
    }));
  }
}

async function processSearch(env: Env, message: Message<FaceQueueMessage>, input: Extract<FaceQueueMessage, { kind: "search" }>) {
  const session = await claimSearch(env, input);
  if (!session) {
    message.ack();
    return;
  }
  const jobCounts = await env.DB.prepare(
    `SELECT
       SUM(CASE WHEN j.status IN ('queued', 'processing') THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN j.status = 'failed' THEN 1 ELSE 0 END) AS failed
     FROM face_index_jobs j JOIN media_files m ON m.id = j.media_file_id
     WHERE m.event_id = ? AND j.organization_id = ?`,
  ).bind(session.event_id, session.organization_id).first<{ pending: number | null; failed: number | null }>();
  if ((jobCounts?.pending ?? 0) > 0) {
    await env.DB.prepare(
      `UPDATE face_search_sessions SET status = 'queued', attempt_count = attempt_count - 1, updated_at = ?
       WHERE id = ? AND organization_id = ? AND status = 'searching'`,
    ).bind(new Date().toISOString(), session.id, session.organization_id).run();
    message.retry({ delaySeconds: 10 });
    return;
  }
  if ((jobCounts?.failed ?? 0) > 0) {
    await finishSearch(env, session, "failed", "FACE_INDEX_INCOMPLETE");
    message.ack();
    return;
  }
  try {
    const faceProvider = provider(env);
    const configuredThreshold = Number(env.FACE_MATCH_THRESHOLD);
    const threshold = Number.isFinite(configuredThreshold) ? configuredThreshold : FACE_SEARCH_DEFAULT_THRESHOLD;
    let matches;
    if (session.selfie_object_key) {
      const selfie = await env.MEDIA.get(session.selfie_object_key);
      if (!selfie?.body) throw new Error("SELFIE_NOT_FOUND");
      const bytes = new Uint8Array(await selfie.arrayBuffer());
      matches = await faceProvider.searchFaces(faceCollectionId(session.event_id), bytes, threshold);
      await rememberGuestProbe(env, session, faceProvider, bytes);
    } else {
      const probeFaceId = await guestProbeFaceId(env, session, faceProvider.name);
      if (!probeFaceId) {
        await finishSearch(env, session, "failed", "PROBE_MISSING");
        message.ack();
        return;
      }
      matches = await faceProvider.searchFacesById(faceCollectionId(session.event_id), probeFaceId, threshold);
    }
    const now = new Date().toISOString();
    await env.DB.prepare("DELETE FROM face_search_matches WHERE session_id = ?").bind(session.id).run();
    for (let offset = 0; offset < matches.length; offset += 100) {
      const chunk = matches.slice(offset, offset + 100);
      await env.DB.batch(chunk.map((match) => env.DB.prepare(
        `INSERT INTO face_search_matches (session_id, media_file_id, similarity, provider, created_at)
         SELECT ?, f.media_file_id, ?, ?, ? FROM face_provider_faces f
         WHERE f.event_id = ? AND f.provider = ? AND f.provider_face_id = ?
         ON CONFLICT(session_id, media_file_id) DO UPDATE SET
           similarity = MAX(face_search_matches.similarity, excluded.similarity)`,
      ).bind(
        session.id, match.similarity, faceProvider.name, now,
        session.event_id, faceProvider.name, match.providerFaceId,
      )));
    }
    await finishSearch(env, session, "completed", null);
    message.ack();
  } catch (error) {
    const code = errorCode(error);
    const retryable = error instanceof FaceProviderError ? error.retryable : code !== "SELFIE_NOT_FOUND";
    if (retryable && session.attempt_count < MAX_ATTEMPTS) {
      await env.DB.prepare(
        `UPDATE face_search_sessions SET status = 'queued', error_code = ?, updated_at = ?
         WHERE id = ? AND organization_id = ? AND status = 'searching'`,
      ).bind(code, new Date().toISOString(), session.id, session.organization_id).run();
      message.retry({ delaySeconds: Math.min(120, 15 * session.attempt_count) });
    } else {
      await finishSearch(env, session, "failed", code);
      message.ack();
    }
    console.error(JSON.stringify({ event: "face_search.failed", sessionId: session.id, errorCode: code }));
  }
}

async function recoverAndCleanup(env: Env): Promise<void> {
  const now = new Date().toISOString();
  const staleBefore = new Date(Date.now() - STALE_BEFORE_MS).toISOString();
  const expired = await env.DB.prepare(
    `SELECT id, selfie_object_key FROM face_search_sessions
     WHERE expires_at <= ? AND selfie_object_key IS NOT NULL LIMIT 100`,
  ).bind(now).all<{ id: string; selfie_object_key: string }>();
  for (const session of expired.results) {
    await env.MEDIA.delete(session.selfie_object_key);
    await env.DB.prepare(
      `UPDATE face_search_sessions SET status = 'expired', selfie_object_key = NULL,
       error_code = 'SESSION_EXPIRED', completed_at = ?, updated_at = ?
       WHERE id = ? AND expires_at <= ? AND status NOT IN ('completed', 'withdrawn')`,
    ).bind(now, now, session.id, now).run();
  }

  if (env.FACE_SEARCH_ENABLED !== "true") return;

  const staleJobs = await env.DB.prepare(
    `SELECT id, media_file_id, organization_id FROM face_index_jobs
     WHERE (status = 'queued' AND (last_enqueued_at IS NULL OR last_enqueued_at < ?))
        OR (status = 'processing' AND processing_started_at < ?)
     ORDER BY updated_at LIMIT 100`,
  ).bind(staleBefore, staleBefore).all<{ id: string; media_file_id: string; organization_id: string }>();
  for (const job of staleJobs.results) {
    await env.DB.prepare(
      `UPDATE face_index_jobs SET status = 'queued', last_enqueued_at = ?,
       processing_started_at = NULL, updated_at = ? WHERE id = ? AND organization_id = ?`,
    ).bind(now, now, job.id, job.organization_id).run();
    await env.FACE_PROCESSING_QUEUE.send({ kind: "index", jobId: job.id, mediaId: job.media_file_id, organizationId: job.organization_id });
  }

  const staleSearches = await env.DB.prepare(
    `SELECT id, organization_id FROM face_search_sessions
     WHERE status IN ('queued', 'searching') AND updated_at < ? AND expires_at > ? LIMIT 100`,
  ).bind(staleBefore, now).all<{ id: string; organization_id: string }>();
  for (const session of staleSearches.results) {
    await env.DB.prepare(
      `UPDATE face_search_sessions SET status = 'queued', updated_at = ?
       WHERE id = ? AND organization_id = ? AND status IN ('queued', 'searching')`,
    ).bind(now, session.id, session.organization_id).run();
    await env.FACE_PROCESSING_QUEUE.send({ kind: "search", sessionId: session.id, organizationId: session.organization_id });
  }

  const expiredFaces = await env.DB.prepare(
    `SELECT event_id, provider, group_concat(provider_face_id) AS face_ids
     FROM face_provider_faces WHERE expires_at <= ?
     GROUP BY event_id, provider LIMIT 25`,
  ).bind(now).all<{ event_id: string; provider: string; face_ids: string }>();
  const expiredProbes = await env.DB.prepare(
    `SELECT event_id, provider, group_concat(provider_face_id) AS face_ids
     FROM face_guest_probes WHERE expires_at <= ?
     GROUP BY event_id, provider LIMIT 25`,
  ).bind(now).all<{ event_id: string; provider: string; face_ids: string }>();
  const faceProvider = expiredFaces.results.length > 0 || expiredProbes.results.length > 0 ? provider(env) : null;
  for (const group of expiredProbes.results) {
    if (!faceProvider) break;
    if (group.provider !== faceProvider.name) continue;
    await faceProvider.deleteFaces(faceCollectionId(group.event_id), group.face_ids.split(","));
    await env.DB.prepare(
      `DELETE FROM face_guest_probes WHERE event_id = ? AND provider = ? AND expires_at <= ?`,
    ).bind(group.event_id, group.provider, now).run();
  }
  for (const group of expiredFaces.results) {
    if (!faceProvider) break;
    if (group.provider !== faceProvider.name) continue;
    const faceIds = group.face_ids.split(",");
    await faceProvider.deleteFaces(faceCollectionId(group.event_id), faceIds);
    await env.DB.prepare(
      `DELETE FROM face_provider_faces WHERE event_id = ? AND provider = ? AND expires_at <= ?`,
    ).bind(group.event_id, group.provider, now).run();
    await env.DB.prepare(
      `UPDATE face_index_jobs SET status = 'queued', attempt_count = 0, error_code = NULL,
       last_enqueued_at = NULL, processing_started_at = NULL, completed_at = NULL, updated_at = ?
       WHERE media_file_id IN (
         SELECT m.id FROM media_files m JOIN events e ON e.id = m.event_id
         JOIN event_entitlements ee ON ee.event_id = e.id
         WHERE m.event_id = ? AND e.status = 'active'
           AND ee.feature_code = 'face_collections' AND ee.value_json = 'true'
       )`,
    ).bind(now, group.event_id).run();
  }
}

export default {
  async queue(batch: MessageBatch<FaceQueueMessage>, env: Env) {
    for (const message of batch.messages) {
      const parsed = faceQueueMessageSchema.safeParse(message.body);
      if (!parsed.success) {
        console.error(JSON.stringify({ event: "face_processing.invalid_message", messageId: message.id }));
        message.ack();
      } else if (env.FACE_SEARCH_ENABLED !== "true") {
        if (parsed.data.kind === "search") {
          const session = await env.DB.prepare(
            `SELECT selfie_object_key FROM face_search_sessions
             WHERE id = ? AND organization_id = ? AND status IN ('queued', 'searching')`,
          ).bind(parsed.data.sessionId, parsed.data.organizationId).first<{ selfie_object_key: string | null }>();
          if (session?.selfie_object_key) await env.MEDIA.delete(session.selfie_object_key);
          await env.DB.prepare(
            `UPDATE face_search_sessions SET status = 'failed', selfie_object_key = NULL,
             error_code = 'FACE_SEARCH_DISABLED', completed_at = ?, updated_at = ?
             WHERE id = ? AND organization_id = ? AND status IN ('queued', 'searching')`,
          ).bind(new Date().toISOString(), new Date().toISOString(), parsed.data.sessionId, parsed.data.organizationId).run();
        }
        message.ack();
      } else if (parsed.data.kind === "index") {
        await processIndex(env, message, parsed.data);
      } else {
        await processSearch(env, message, parsed.data);
      }
    }
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    await recoverAndCleanup(env);
  },
} satisfies ExportedHandler<Env, FaceQueueMessage>;

export { recoverAndCleanup };
