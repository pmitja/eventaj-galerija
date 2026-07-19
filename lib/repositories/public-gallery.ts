import { getCloudflareEnv } from "@/lib/cloudflare";

export type PublicGalleryMediaRow = {
  public_id: string;
  original_filename: string;
  uploaded_at: string;
  comment_count: number;
};

export async function listPublicGalleryMedia(eventId: string): Promise<PublicGalleryMediaRow[]> {
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT m.public_id, m.original_filename, m.uploaded_at,
       (SELECT COUNT(*) FROM media_comments c
        WHERE c.event_id = m.event_id AND c.media_id = m.id AND c.status = 'visible') AS comment_count
     FROM media_files m
     WHERE m.event_id = ? AND m.status = 'ready' AND m.gallery_state = 'visible' AND m.publication_consent = 1
       AND COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')
     ORDER BY m.uploaded_at DESC LIMIT 100`,
  ).bind(eventId).all<PublicGalleryMediaRow>();
  return result.results;
}
