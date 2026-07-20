import { describe, expect, it } from "vitest";
import { archiveSchedulingCutoff, createDeliveryToken, hashDeliveryToken } from "./delivery";

describe("event delivery", () => {
  it("stores only a stable hash of an unpredictable download token", async () => {
    const delivery = await createDeliveryToken(new Date("2026-07-20T12:00:00Z"));
    expect(delivery.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(delivery.hash).not.toBe(delivery.token);
    expect(await hashDeliveryToken(delivery.token)).toBe(delivery.hash);
    expect(delivery.expiresAt).toBe("2026-07-21T12:00:00.000Z");
  });

  it("waits through the upload grace period before scheduling an archive", () => {
    expect(archiveSchedulingCutoff(new Date("2026-07-20T12:00:00Z")))
      .toBe("2026-07-20T11:45:00.000Z");
  });
});
