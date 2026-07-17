import { SLIDESHOW_POLL_INTERVAL_MS } from "@/lib/domain/slideshow";

export function subscribeToSlideshowUpdates(
  refresh: () => Promise<void>,
  intervalMs = SLIDESHOW_POLL_INTERVAL_MS,
): () => void {
  let active = true;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const tick = async () => {
    try {
      await refresh();
    } finally {
      if (active) timeoutId = setTimeout(tick, intervalMs);
    }
  };
  void tick();
  return () => {
    active = false;
    if (timeoutId) clearTimeout(timeoutId);
  };
}
