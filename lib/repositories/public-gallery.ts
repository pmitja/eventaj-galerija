import { getCloudflareEnv } from "@/lib/cloudflare";

export type PublicGalleryMediaRow = {
  public_id: string;
  original_filename: string;
  uploaded_at: string;
};

export async function listPublicGalleryMedia(eventId: string): Promise<PublicGalleryMediaRow[]> {
  const result = await getCloudflareEnv().DB.prepare(
    `SELECT public_id, original_filename, uploaded_at
     FROM media_files
     WHERE event_id = ? AND status = 'ready' AND gallery_state = 'visible' AND publication_consent = 1
       AND COALESCE(quality_override, quality_category) IN ('best', 'good')
     ORDER BY uploaded_at DESC LIMIT 100`,
  ).bind(eventId).all<PublicGalleryMediaRow>();
  return result.results;
}
