import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeToSlideshowUpdates } from "./slideshow-updates";

describe("slideshow update adapter", () => {
  afterEach(() => vi.useRealTimers());

  it("refreshes immediately, repeats, and stops cleanly", async () => {
    vi.useFakeTimers();
    const refresh = vi.fn().mockResolvedValue(undefined);
    const unsubscribe = subscribeToSlideshowUpdates(refresh, 1000);
    await vi.advanceTimersByTimeAsync(0);
    expect(refresh).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(refresh).toHaveBeenCalledTimes(2);
    unsubscribe();
    await vi.advanceTimersByTimeAsync(2000);
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
