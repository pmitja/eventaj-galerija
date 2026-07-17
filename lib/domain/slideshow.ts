export const SLIDESHOW_POLL_INTERVAL_MS = 5_000;
export const SLIDESHOW_FRAME_INTERVAL_MS = 8_000;

export type SlideshowMediaState = "approved" | "hidden";

export function nextSlideshowIndex(current: number, length: number, direction = 1): number {
  if (length <= 0) return 0;
  return (current + direction + length) % length;
}
