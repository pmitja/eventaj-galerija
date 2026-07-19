export const TECHNICAL_QUALITY_MODEL_VERSION = "technical-v2";
export const PERCEPTUAL_DUPLICATE_MAX_DISTANCE = 6;

export type QualityCategory = "best" | "good" | "duplicate" | "blurry" | "low_quality";

export type TechnicalQualityMetrics = {
  sharpness: number;
  exposure: number;
  overall: number;
  meanLuminance: number;
  clippedShadows: number;
  clippedHighlights: number;
  dynamicRange: number;
  laplacianVariance: number;
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function assertRgba(rgba: Uint8Array, width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 3 || height < 3) {
    throw new Error("Image dimensions must be integers of at least 3x3 pixels");
  }
  if (rgba.byteLength !== width * height * 4) {
    throw new Error("RGBA byte length does not match image dimensions");
  }
}

function luminance(rgba: Uint8Array, pixelIndex: number): number {
  const offset = pixelIndex * 4;
  return 0.2126 * rgba[offset] + 0.7152 * rgba[offset + 1] + 0.0722 * rgba[offset + 2];
}

export function analyzeTechnicalQuality(
  rgba: Uint8Array,
  width: number,
  height: number,
): TechnicalQualityMetrics {
  assertRgba(rgba, width, height);
  const pixelCount = width * height;
  const values = new Float32Array(pixelCount);
  const histogram = new Uint32Array(256);
  let luminanceSum = 0;

  for (let index = 0; index < pixelCount; index += 1) {
    const value = luminance(rgba, index);
    values[index] = value;
    luminanceSum += value;
    histogram[Math.round(value)] += 1;
  }

  const meanLuminance = luminanceSum / pixelCount;
  const clippedShadows = histogram.slice(0, 9).reduce((sum, count) => sum + count, 0) / pixelCount;
  const clippedHighlights = histogram.slice(247).reduce((sum, count) => sum + count, 0) / pixelCount;

  const percentile = (target: number): number => {
    let seen = 0;
    for (let value = 0; value < histogram.length; value += 1) {
      seen += histogram[value];
      if (seen >= pixelCount * target) return value;
    }
    return 255;
  };
  const dynamicRange = (percentile(0.95) - percentile(0.05)) / 255;
  const brightnessBalance = 1 - Math.abs(meanLuminance - 127.5) / 127.5;
  const clippingPenalty = clamp((clippedShadows + clippedHighlights) * 2);
  const exposure = clamp(
    brightnessBalance * 0.55 + dynamicRange * 0.3 + (1 - clippingPenalty) * 0.15,
  );

  let laplacianSum = 0;
  let laplacianSquaredSum = 0;
  let samples = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const center = y * width + x;
      const laplacian =
        values[center - width] + values[center - 1] - 4 * values[center]
        + values[center + 1] + values[center + width];
      laplacianSum += laplacian;
      laplacianSquaredSum += laplacian * laplacian;
      samples += 1;
    }
  }
  const laplacianMean = laplacianSum / samples;
  const laplacianVariance = Math.max(0, laplacianSquaredSum / samples - laplacianMean ** 2);
  const sharpness = clamp(Math.sqrt(laplacianVariance) / 60);
  const overall = clamp(sharpness * 0.65 + exposure * 0.35);

  return {
    sharpness,
    exposure,
    overall,
    meanLuminance,
    clippedShadows,
    clippedHighlights,
    dynamicRange,
    laplacianVariance,
  };
}

export function createDifferenceHash(rgba: Uint8Array, width: number, height: number): string {
  assertRgba(rgba, width, height);
  let hash = "";
  let nibble = 0;
  let nibbleBits = 0;
  for (let sampleY = 0; sampleY < 8; sampleY += 1) {
    const y = Math.min(height - 1, Math.floor(((sampleY + 0.5) * height) / 8));
    for (let sampleX = 0; sampleX < 8; sampleX += 1) {
      const leftX = Math.min(width - 1, Math.floor(((sampleX + 0.5) * width) / 9));
      const rightX = Math.min(width - 1, Math.floor(((sampleX + 1.5) * width) / 9));
      nibble = (nibble << 1)
        | (luminance(rgba, y * width + leftX) > luminance(rgba, y * width + rightX) ? 1 : 0);
      nibbleBits += 1;
      if (nibbleBits === 4) {
        hash += nibble.toString(16);
        nibble = 0;
        nibbleBits = 0;
      }
    }
  }
  return hash;
}

export function perceptualHashDistance(left: string, right: string): number {
  if (!/^[a-f\d]{16}$/i.test(left) || !/^[a-f\d]{16}$/i.test(right)) {
    throw new Error("Perceptual hashes must be 64-bit hexadecimal strings");
  }
  let distance = 0;
  const bitCounts = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
  for (let index = 0; index < left.length; index += 1) {
    distance += bitCounts[Number.parseInt(left[index], 16) ^ Number.parseInt(right[index], 16)];
  }
  return distance;
}

export function categorizeTechnicalQuality(
  metrics: TechnicalQualityMetrics,
  duplicate: boolean,
): QualityCategory {
  if (duplicate) return "duplicate";
  if (metrics.sharpness < 0.12) return "blurry";
  // A dark image is not necessarily a bad image (night scenes, logos and
  // intentionally black backgrounds). Only use exposure as a hard gate when
  // the image also lacks useful edge detail or tonal range.
  if (metrics.exposure < 0.28 && (metrics.sharpness < 0.2 || metrics.dynamicRange < 0.2)) {
    return "low_quality";
  }
  if (metrics.overall >= 0.72) return "best";
  return "good";
}
