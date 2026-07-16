import { describe, expect, it } from "vitest";
import { createAccessPointSchema, publicAccessPointCodeSchema } from "./access-points";

describe("access point validation", () => {
  it("accepts a named QR point and rejects short public codes", () => {
    expect(createAccessPointSchema.parse({ label: "Glavni vhod" })).toEqual({
      label: "Glavni vhod",
      type: "qr",
    });
    expect(publicAccessPointCodeSchema.safeParse("predictable").success).toBe(false);
  });
});
