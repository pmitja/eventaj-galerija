import { revalidateTag } from "next/cache";

export function publicGalleryCacheTag(eventId: string): string {
  return `public-gallery:${eventId}`;
}

export function invalidatePublicGallery(eventId: string): void {
  revalidateTag(publicGalleryCacheTag(eventId), { expire: 0 });
}
