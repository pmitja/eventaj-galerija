import { getCloudflareEnv } from "@/lib/cloudflare";

export type UploadSessionRow = {
  id: string;
  event_id: string;
  token_hash: string;
  access_point_id: string | null;
  expires_at: string;
  created_at: string;
};

export type MediaRow = {
  id: string;
  public_id: string;
  event_id: string;
  upload_session_id: string;
  object_key: string;
  gallery_key: string | null;
  thumbnail_key: string | null;
  original_filename: string;
  declared_mime: string;
  size_bytes: number;
  status: "pending" | "processing" | "ready" | "rejected";
  gallery_state: "visible" | "hidden";
  publication_consent: number;
  uploaded_at: string | null;
  created_at: string;
};

export async function createUploadSession(
  eventId: string,
  tokenHash: string,
  accessPointId: string | null = null,
): Promise<UploadSessionRow> {
  const id = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO upload_sessions (id, event_id, token_hash, access_point_id, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(id, eventId, tokenHash, accessPointId, expiresAt.toISOString(), createdAt.toISOString()).run();
  return {
    id,
    event_id: eventId,
    token_hash: tokenHash,
    access_point_id: accessPointId,
    expires_at: expiresAt.toISOString(),
    created_at: createdAt.toISOString(),
  };
}

export async function findValidUploadSession(tokenHash: string): Promise<UploadSessionRow | null> {
  return getCloudflareEnv().DB.prepare(
    "SELECT * FROM upload_sessions WHERE token_hash = ? AND expires_at > ?",
  ).bind(tokenHash, new Date().toISOString()).first<UploadSessionRow>();
}

export async function countSessionFiles(sessionId: string): Promise<number> {
  const row = await getCloudflareEnv().DB.prepare(
    "SELECT COUNT(*) AS count FROM media_files WHERE upload_session_id = ?",
  ).bind(sessionId).first<{ count: number }>();
  return row?.count ?? 0;
}

export async function insertPendingMedia(input: {
  sessionId: string;
  eventId: string;
  objectKey: string;
  filename: string;
  mime: string;
  sizeBytes: number;
  publicationConsent: boolean;
}): Promise<MediaRow> {
  const id = crypto.randomUUID();
  const publicId = crypto.randomUUID().replaceAll("-", "");
  const now = new Date().toISOString();
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO media_files
      (id, public_id, event_id, upload_session_id, object_key, original_filename, declared_mime, size_bytes, publication_consent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id, publicId, input.eventId, input.sessionId, input.objectKey,
    input.filename, input.mime, input.sizeBytes, input.publicationConsent ? 1 : 0, now,
  ).run();
  return findMediaById(id) as Promise<MediaRow>;
}

export async function findMediaById(id: string): Promise<MediaRow | null> {
  return getCloudflareEnv().DB.prepare("SELECT * FROM media_files WHERE id = ?").bind(id).first<MediaRow>();
}

export async function markMediaProcessing(id: string): Promise<boolean> {
  const result = await getCloudflareEnv().DB.prepare(
    "UPDATE media_files SET status = 'processing' WHERE id = ? AND status = 'pending'",
  ).bind(id).run();
  return result.meta.changes === 1;
}

export async function markMediaReady(id: string, galleryKey: string, thumbnailKey: string): Promise<void> {
  await getCloudflareEnv().DB.prepare(
    "UPDATE media_files SET status = 'ready', gallery_key = ?, thumbnail_key = ?, uploaded_at = ? WHERE id = ? AND status = 'processing'",
  ).bind(galleryKey, thumbnailKey, new Date().toISOString(), id).run();
}

export async function rejectMedia(id: string): Promise<void> {
  await getCloudflareEnv().DB.prepare(
    "UPDATE media_files SET status = 'rejected' WHERE id = ? AND status IN ('pending', 'processing')",
  ).bind(id).run();
}
