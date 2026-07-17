import { unstable_cache } from "next/cache";
import { publicGalleryCacheTag } from "@/lib/cache/public-gallery";
import { getCloudflareEnv } from "@/lib/cloudflare";

export type PublicGalleryMediaRow = {
  public_id: string;
  original_filename: string;
  uploaded_at: string;
};

export function listPublicGalleryMedia(eventId: string): Promise<PublicGalleryMediaRow[]> {
  return unstable_cache(
    async () => {
      const result = await getCloudflareEnv().DB.prepare(
        `SELECT public_id, original_filename, uploaded_at
         FROM media_files
         WHERE event_id = ? AND status = 'ready' AND gallery_state = 'visible' AND publication_consent = 1
         ORDER BY uploaded_at DESC LIMIT 100`,
      ).bind(eventId).all<PublicGalleryMediaRow>();
      return result.results;
    },
    ["public-gallery-media", eventId],
    {
      tags: [publicGalleryCacheTag(eventId)],
      revalidate: 60 * 60,
    },
  )();
}
