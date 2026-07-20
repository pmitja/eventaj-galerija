export const FACE_SEARCH_SESSION_TTL_MS = 15 * 60 * 1000;
export const FACE_SEARCH_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const FACE_SEARCH_MAX_SESSIONS_PER_HOUR = 5;
export const FACE_SEARCH_DEFAULT_THRESHOLD = 90;
export const FACE_EMBEDDING_RETENTION_DAYS = 30;
export const FACE_SEARCH_LOCAL_RESULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type FaceSearchStatus =
  | "awaiting_upload"
  | "queued"
  | "searching"
  | "completed"
  | "failed"
  | "withdrawn"
  | "expired";

export function packageIncludesFaceCollections(packageCode: string): boolean {
  return packageCode === "premium";
}

export function faceSearchExpiresAt(now = new Date()): string {
  return new Date(now.getTime() + FACE_SEARCH_SESSION_TTL_MS).toISOString();
}

export function faceEmbeddingExpiresAt(eventRetentionUntil: string, now = new Date()): string {
  const biometricLimit = now.getTime() + FACE_EMBEDDING_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return new Date(Math.min(new Date(eventRetentionUntil).getTime(), biometricLimit)).toISOString();
}

export function isTerminalFaceSearchStatus(status: FaceSearchStatus): boolean {
  return status === "completed" || status === "failed" || status === "withdrawn" || status === "expired";
}

export function faceCollectionId(eventId: string): string {
  return `eventaj-${eventId}`.replace(/[^a-zA-Z0-9_.-]/g, "-").slice(0, 255);
}

export function faceSearchResultStorageKey(eventSlug: string, guestId: string): string {
  return `eventaj:face-matches:v1:${eventSlug}:${guestId}`;
}

export function isFaceSearchLocalResultCurrent(
  createdAt: string,
  policyVersion: string,
  currentPolicyVersion: string,
  now = new Date(),
): boolean {
  const createdAtMs = new Date(createdAt).getTime();
  return policyVersion === currentPolicyVersion
    && Number.isFinite(createdAtMs)
    && createdAtMs <= now.getTime()
    && now.getTime() - createdAtMs <= FACE_SEARCH_LOCAL_RESULT_TTL_MS;
}
