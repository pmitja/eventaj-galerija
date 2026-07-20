export const EVENT_PRICE_CENTS = 3_500;
export const AI_BEST_PHOTOS_PRICE_CENTS = 1_500;
export const AI_BEST_PHOTOS_LIMIT = 3_000;
export const BILLING_CURRENCY = "EUR";

export function checkoutTotalCents(aiBestPhotos: boolean): number {
  return EVENT_PRICE_CENTS + (aiBestPhotos ? AI_BEST_PHOTOS_PRICE_CENTS : 0);
}
