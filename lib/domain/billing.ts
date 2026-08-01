export const EVENT_PRICE_CENTS = 3_500;
export const AI_BEST_PHOTOS_PRICE_CENTS = 1_500;
export const AI_BEST_PHOTOS_LIMIT = 3_000;
export const FACE_COLLECTIONS_PRICE_CENTS = 500;
export const VIDEO_UNLIMITED_PRICE_CENTS = 1_500;
export const INCLUDED_VIDEO_COUNT = 20;
export const VIDEO_MAX_DURATION_SECONDS = 60;
export const VIDEO_MAX_BYTES = 500 * 1024 * 1024;
export const VIDEO_FAIR_USE_COUNT = 1_000;
export const BILLING_CURRENCY = "EUR";

export function checkoutTotalCents(aiBestPhotos: boolean, faceCollections = false, videoUnlimited = false): number {
  return EVENT_PRICE_CENTS
    + (aiBestPhotos ? AI_BEST_PHOTOS_PRICE_CENTS : 0)
    + (faceCollections ? FACE_COLLECTIONS_PRICE_CENTS : 0)
    + (videoUnlimited ? VIDEO_UNLIMITED_PRICE_CENTS : 0);
}
