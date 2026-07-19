import { describe, expect, it } from "vitest";
import {
  analyzeTechnicalQuality,
  categorizeTechnicalQuality,
  createDifferenceHash,
  perceptualHashDistance,
} from "./media-quality";

function rgbaImage(width: number, height: number, valueAt: (x: number, y: number) => number): Uint8Array {
  const bytes = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const value = valueAt(x, y);
      bytes.set([value, value, value, 255], offset);
    }
  }
  return bytes;
}

describe("technical media quality", () => {
  it("recognizes a uniform image as blurry", () => {
    const metrics = analyzeTechnicalQuality(rgbaImage(16, 16, () => 128), 16, 16);
    expect(metrics.sharpness).toBe(0);
    expect(categorizeTechnicalQuality(metrics, false)).toBe("blurry");
  });

  it("gives a high sharpness score to strong alternating edges", () => {
    const metrics = analyzeTechnicalQuality(
      rgbaImage(16, 16, (x, y) => (x + y) % 2 === 0 ? 0 : 255),
      16,
      16,
    );
    expect(metrics.sharpness).toBe(1);
    expect(metrics.laplacianVariance).toBeGreaterThan(10_000);
  });

  it("always categorizes an identified duplicate as duplicate", () => {
    const metrics = analyzeTechnicalQuality(rgbaImage(16, 16, (x) => x * 16), 16, 16);
    expect(categorizeTechnicalQuality(metrics, true)).toBe("duplicate");
  });

  it("keeps an intentionally dark but sharp image out of low quality", () => {
    expect(categorizeTechnicalQuality({
      sharpness: 0.66,
      exposure: 0.2,
      overall: 0.5,
      meanLuminance: 17,
      clippedShadows: 0.87,
      clippedHighlights: 0.01,
      dynamicRange: 0.43,
      laplacianVariance: 1575,
    }, false)).toBe("good");
  });

  it("still rejects a dark image with little usable tonal detail", () => {
    expect(categorizeTechnicalQuality({
      sharpness: 0.18,
      exposure: 0.2,
      overall: 0.19,
      meanLuminance: 15,
      clippedShadows: 0.9,
      clippedHighlights: 0,
      dynamicRange: 0.12,
      laplacianVariance: 100,
    }, false)).toBe("low_quality");
  });

  it("creates stable 64-bit difference hashes and measures their distance", () => {
    const first = createDifferenceHash(rgbaImage(18, 16, (x) => x * 12), 18, 16);
    const same = createDifferenceHash(rgbaImage(18, 16, (x) => x * 12), 18, 16);
    expect(first).toMatch(/^[a-f\d]{16}$/);
    expect(perceptualHashDistance(first, same)).toBe(0);
    expect(perceptualHashDistance("0000000000000000", "000000000000000f")).toBe(4);
  });
});
