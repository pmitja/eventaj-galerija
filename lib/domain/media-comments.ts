export const COMMENT_RATE_LIMIT = 5;
export const COMMENT_RATE_WINDOW_MS = 60_000;
export const LIVE_COMMENT_WINDOW_MS = 2 * 60_000;
export const LIVE_COMMENT_LIMIT = 20;
export const LIVE_COMMENT_DURATION_MS = 7_000;
export const MAX_VISIBLE_LIVE_COMMENTS = 3;

export type LiveMediaComment = {
  id: string;
  displayName: string;
  body: string;
  createdAt: string;
};

export function cleanCommentBody(value: string): string {
  return value.trim().replace(/\n{3,}/g, "\n\n");
}

export function galleryLikesStorageKey(eventSlug: string): string {
  return `eventaj:likes:v1:${eventSlug}`;
}

export function toggleMediaLike(mediaIds: string[], mediaId: string): string[] {
  return mediaIds.includes(mediaId)
    ? mediaIds.filter((candidate) => candidate !== mediaId)
    : [...mediaIds, mediaId];
}
