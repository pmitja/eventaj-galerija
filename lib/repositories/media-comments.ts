import { getCloudflareEnv } from "@/lib/cloudflare";
import {
  cleanCommentBody,
  COMMENT_RATE_LIMIT,
  COMMENT_RATE_WINDOW_MS,
  LIVE_COMMENT_LIMIT,
  LIVE_COMMENT_WINDOW_MS,
  MAX_SLIDE_COMMENTS,
  type LiveMediaComment,
} from "@/lib/domain/media-comments";
import type { CreateMediaComment } from "@/lib/validation/media-comments";

export type PublicMediaComment = {
  id: string;
  guestId: string;
  displayName: string;
  body: string;
  createdAt: string;
};

type CommentRow = {
  id: string;
  guest_id: string;
  display_name: string | null;
  body: string;
  created_at: string;
};

type LiveCommentRow = Omit<CommentRow, "guest_id"> & {
  media_public_id: string;
  media_filename: string | null;
};

function toPublicComment(row: CommentRow): PublicMediaComment {
  return {
    id: row.id,
    guestId: row.guest_id,
    displayName: row.display_name ?? "Gost",
    body: row.body,
    createdAt: row.created_at,
  };
}

const PUBLIC_MEDIA_WHERE = `m.event_id = ? AND m.public_id = ?
  AND m.status = 'ready' AND m.gallery_state = 'visible' AND m.publication_consent = 1
  AND COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')`;

export async function listMediaComments(eventId: string, publicMediaId: string): Promise<PublicMediaComment[] | null> {
  const DB = getCloudflareEnv().DB;
  const media = await DB.prepare(`SELECT m.id FROM media_files m WHERE ${PUBLIC_MEDIA_WHERE}`)
    .bind(eventId, publicMediaId).first<{ id: string }>();
  if (!media) return null;

  const result = await DB.prepare(
    `SELECT c.id, c.guest_id, g.display_name, c.body, c.created_at
     FROM media_comments c
     JOIN event_guests g ON g.id = c.guest_id AND g.event_id = c.event_id
     WHERE c.event_id = ? AND c.media_id = ? AND c.status = 'visible'
     ORDER BY c.created_at ASC
     LIMIT 100`,
  ).bind(eventId, media.id).all<CommentRow>();
  return result.results.map(toPublicComment);
}

export async function listLiveMediaComments(eventId: string): Promise<LiveMediaComment[]> {
  const cutoff = new Date(Date.now() - LIVE_COMMENT_WINDOW_MS).toISOString();
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT c.id, g.display_name, c.body, c.created_at,
            m.public_id AS media_public_id, m.original_filename AS media_filename
     FROM media_comments c
     JOIN events e ON e.id = c.event_id
     JOIN event_guests g ON g.id = c.guest_id AND g.event_id = c.event_id
     JOIN media_files m ON m.id = c.media_id AND m.event_id = c.event_id
     WHERE c.event_id = ? AND e.comments_enabled = 1 AND c.status = 'visible'
       AND c.created_at >= ? AND g.show_on_live_screen = 1 AND g.display_name IS NOT NULL
       AND m.status = 'ready' AND m.slideshow_state = 'approved' AND m.publication_consent = 1
       AND COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')
     ORDER BY c.created_at DESC
     LIMIT ?`,
  ).bind(eventId, cutoff, LIVE_COMMENT_LIMIT).all<LiveCommentRow>();
  return result.results.reverse().map(toLiveComment);
}

function toLiveComment(row: LiveCommentRow): LiveMediaComment {
  return {
    id: row.id,
    displayName: row.display_name ?? "Gost",
    body: row.body,
    createdAt: row.created_at,
    mediaPublicId: row.media_public_id,
    mediaFilename: row.media_filename ?? "",
  };
}

export async function listSlideMediaComments(eventId: string): Promise<Record<string, LiveMediaComment[]>> {
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT id, display_name, body, created_at, media_public_id, media_filename FROM (
       SELECT c.id, g.display_name, c.body, c.created_at,
              m.public_id AS media_public_id, m.original_filename AS media_filename,
              ROW_NUMBER() OVER (PARTITION BY c.media_id ORDER BY c.created_at DESC) AS rn
       FROM media_comments c
       JOIN events e ON e.id = c.event_id
       JOIN event_guests g ON g.id = c.guest_id AND g.event_id = c.event_id
       JOIN media_files m ON m.id = c.media_id AND m.event_id = c.event_id
       WHERE c.event_id = ? AND e.comments_enabled = 1 AND c.status = 'visible'
         AND g.show_on_live_screen = 1 AND g.display_name IS NOT NULL
         AND m.status = 'ready' AND m.slideshow_state = 'approved' AND m.publication_consent = 1
         AND COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')
     )
     WHERE rn <= ?
     ORDER BY media_public_id, created_at ASC`,
  ).bind(eventId, MAX_SLIDE_COMMENTS).all<LiveCommentRow>();

  const grouped: Record<string, LiveMediaComment[]> = {};
  for (const row of result.results) {
    (grouped[row.media_public_id] ??= []).push(toLiveComment(row));
  }
  return grouped;
}

export type CreateMediaCommentResult =
  | { status: "created"; comment: PublicMediaComment }
  | { status: "guest_not_found" }
  | { status: "media_not_found" }
  | { status: "rate_limited" };

export async function createMediaComment(
  eventId: string,
  publicMediaId: string,
  input: CreateMediaComment,
): Promise<CreateMediaCommentResult> {
  const DB = getCloudflareEnv().DB;
  const [guest, media] = await Promise.all([
    DB.prepare("SELECT id FROM event_guests WHERE id = ? AND event_id = ?")
      .bind(input.guestId, eventId).first<{ id: string }>(),
    DB.prepare(`SELECT m.id FROM media_files m WHERE ${PUBLIC_MEDIA_WHERE}`)
      .bind(eventId, publicMediaId).first<{ id: string }>(),
  ]);
  if (!guest) return { status: "guest_not_found" };
  if (!media) return { status: "media_not_found" };

  const now = new Date();
  const windowStart = new Date(now.getTime() - COMMENT_RATE_WINDOW_MS).toISOString();
  const recent = await DB.prepare(
    `SELECT COUNT(*) AS count FROM media_comments
     WHERE event_id = ? AND guest_id = ? AND created_at >= ?`,
  ).bind(eventId, input.guestId, windowStart).first<{ count: number }>();
  if ((recent?.count ?? 0) >= COMMENT_RATE_LIMIT) return { status: "rate_limited" };

  const id = crypto.randomUUID();
  const createdAt = now.toISOString();
  await DB.prepare(
    `INSERT INTO media_comments
      (id, event_id, media_id, guest_id, body, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'visible', ?, ?)`,
  ).bind(id, eventId, media.id, input.guestId, cleanCommentBody(input.body), createdAt, createdAt).run();

  const row = await DB.prepare(
    `SELECT c.id, c.guest_id, g.display_name, c.body, c.created_at
     FROM media_comments c JOIN event_guests g ON g.id = c.guest_id
     WHERE c.id = ? AND c.event_id = ?`,
  ).bind(id, eventId).first<CommentRow>();
  if (!row) throw new Error("Created media comment could not be read");
  return { status: "created", comment: toPublicComment(row) };
}
