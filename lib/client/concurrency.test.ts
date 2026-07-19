import { describe, expect, it } from "vitest";
import { runWithConcurrency } from "./concurrency";

describe("runWithConcurrency", () => {
  it("never runs more than the configured number of tasks", async () => {
    let active = 0;
    let peak = 0;
    const completed: number[] = [];
    await runWithConcurrency([1, 2, 3, 4, 5, 6, 7], 3, async (item) => {
      active += 1;
      peak = Math.max(peak, active);
      await Promise.resolve();
      completed.push(item);
      active -= 1;
    });
    expect(peak).toBe(3);
    expect(completed.sort((left, right) => left - right)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("rejects an invalid concurrency limit", async () => {
    await expect(runWithConcurrency([1], 0, async () => undefined)).rejects.toThrow(
      "Concurrency must be a positive integer",
    );
  });
});
