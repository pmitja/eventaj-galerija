import { getCloudflareEnv } from "@/lib/cloudflare";
import type { SlideshowMediaState } from "@/lib/domain/slideshow";

export type SlideshowRow = {
  id: string;
  event_id: string;
  token_hash: string;
  status: "active" | "revoked";
  created_at: string;
  rotated_at: string;
};

export type PublicSlideshow = SlideshowRow & {
  event_name: string;
  event_slug: string;
};

export type SlideshowMediaRow = {
  public_id: string;
  original_filename: string;
  uploaded_at: string;
};

export async function findOwnedSlideshow(eventId: string, organizationId: string): Promise<SlideshowRow | null> {
  const { DB } = getCloudflareEnv();
  return DB.prepare(
    `SELECT s.* FROM slideshows s JOIN events e ON e.id = s.event_id
     WHERE s.event_id = ? AND e.organization_id = ?`,
  ).bind(eventId, organizationId).first<SlideshowRow>();
}

export async function rotateSlideshow(eventId: string, tokenHash: string, organizationId: string): Promise<SlideshowRow> {
  const { DB } = getCloudflareEnv();
  const event = await DB.prepare("SELECT id FROM events WHERE id = ? AND organization_id = ?")
    .bind(eventId, organizationId).first<{ id: string }>();
  if (!event) throw new Error("EVENT_NOT_FOUND");
  const now = new Date().toISOString();
  await DB.prepare(
    `INSERT INTO slideshows (id, event_id, token_hash, status, created_at, rotated_at)
     VALUES (?, ?, ?, 'active', ?, ?)
     ON CONFLICT(event_id) DO UPDATE SET token_hash = excluded.token_hash, status = 'active', rotated_at = excluded.rotated_at`,
  ).bind(crypto.randomUUID(), eventId, tokenHash, now, now).run();
  return findOwnedSlideshow(eventId, organizationId) as Promise<SlideshowRow>;
}

export async function findPublicSlideshow(tokenHash: string): Promise<PublicSlideshow | null> {
  return getCloudflareEnv().DB.prepare(
    `SELECT s.*, e.name AS event_name, e.public_slug AS event_slug
     FROM slideshows s JOIN events e ON e.id = s.event_id
     WHERE s.token_hash = ? AND s.status = 'active' AND e.status IN ('active', 'ended')`,
  ).bind(tokenHash).first<PublicSlideshow>();
}

export async function listSlideshowMedia(eventId: string): Promise<SlideshowMediaRow[]> {
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT public_id, original_filename, uploaded_at FROM media_files
     WHERE event_id = ? AND status = 'ready' AND slideshow_state = 'approved' AND publication_consent = 1
       AND COALESCE(quality_override, quality_category) IN ('best', 'good')
     ORDER BY uploaded_at DESC LIMIT 200`,
  ).bind(eventId).all<SlideshowMediaRow>();
  return result.results;
}

export async function findSlideshowMediaKey(tokenHash: string, publicId: string): Promise<string | null> {
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT m.gallery_key FROM media_files m
     JOIN slideshows s ON s.event_id = m.event_id
     JOIN events e ON e.id = m.event_id
     WHERE s.token_hash = ? AND s.status = 'active' AND e.status IN ('active', 'ended')
       AND m.public_id = ? AND m.status = 'ready' AND m.slideshow_state = 'approved'
       AND m.publication_consent = 1
       AND COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')`,
  ).bind(tokenHash, publicId).first<{ gallery_key: string | null }>();
  return row?.gallery_key ?? null;
}

export async function setMediaSlideshowState(
  eventId: string,
  mediaId: string,
  state: SlideshowMediaState,
  organizationId: string,
): Promise<boolean> {
  const { DB } = getCloudflareEnv();
  const result = await DB.prepare(
    `UPDATE media_files SET slideshow_state = ?
     WHERE id = ? AND event_id = ? AND EXISTS (
       SELECT 1 FROM events e WHERE e.id = media_files.event_id AND e.organization_id = ?
     )`,
  ).bind(state, mediaId, eventId, organizationId).run();
  return result.meta.changes === 1;
}
