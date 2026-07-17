import { createHash } from "node:crypto";
import {
  analyzeTechnicalQuality,
  categorizeTechnicalQuality,
  createDifferenceHash,
  TECHNICAL_QUALITY_MODEL_VERSION,
} from "../domain/media-quality";
import {
  findEarlierDuplicate,
  reconcileLaterDuplicates,
  saveTechnicalAnalysis,
  saveTechnicalAnalysisFailure,
} from "../repositories/media-quality";

export const ANALYSIS_SIZE = 256;

export type TechnicalAnalysisMedia = {
  id: string;
  event_id: string;
  object_key: string;
  size_bytes: number;
  declared_mime: string;
  created_at: string;
};

export type ImageInspection = { checksumSha256: string; width: number; height: number };

export type TechnicalAnalysisRuntime = {
  DB: D1Database;
  MEDIA: R2Bucket;
  IMAGES: ImagesBinding;
};

export async function inspectAndChecksum(
  images: ImagesBinding,
  stream: ReadableStream<Uint8Array>,
  declaredMime: string,
): Promise<ImageInspection> {
  const hash = createHash("sha256");
  const hashingStream = stream.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      hash.update(chunk);
      controller.enqueue(chunk);
    },
  }));
  const info = await images.info(hashingStream);
  if (!("width" in info) || info.width < 1 || info.height < 1) throw new Error("Unsupported image dimensions");
  const normalizedMime = (mime: string) => mime === "image/heif" ? "image/heic" : mime;
  if (normalizedMime(info.format) !== normalizedMime(declaredMime)) {
    throw new Error("Detected image format does not match the upload declaration");
  }
  return { checksumSha256: hash.digest("hex"), width: info.width, height: info.height };
}

export async function persistTechnicalAnalysis(
  env: TechnicalAnalysisRuntime,
  media: TechnicalAnalysisMedia,
  organizationId: string,
  inspection: ImageInspection,
  analysisBytes: Uint8Array,
): Promise<void> {
  const metrics = analyzeTechnicalQuality(analysisBytes, ANALYSIS_SIZE, ANALYSIS_SIZE);
  const perceptualHash = createDifferenceHash(analysisBytes, ANALYSIS_SIZE, ANALYSIS_SIZE);
  const duplicate = await findEarlierDuplicate({
    organizationId,
    eventId: media.event_id,
    mediaId: media.id,
    checksumSha256: inspection.checksumSha256,
    perceptualHash,
    createdAt: media.created_at,
  }, env.DB);
  await saveTechnicalAnalysis({
    organizationId,
    eventId: media.event_id,
    mediaId: media.id,
    checksumSha256: inspection.checksumSha256,
    perceptualHash,
    width: inspection.width,
    height: inspection.height,
    createdAt: media.created_at,
    metrics,
    category: categorizeTechnicalQuality(metrics, duplicate !== null),
    duplicate,
    modelVersion: TECHNICAL_QUALITY_MODEL_VERSION,
  }, env.DB);
  await reconcileLaterDuplicates({
    organizationId,
    eventId: media.event_id,
    mediaId: media.id,
    canonicalMediaId: duplicate?.mediaId ?? media.id,
    checksumSha256: inspection.checksumSha256,
    perceptualHash,
    createdAt: media.created_at,
  }, env.DB);
}

export async function recordTechnicalAnalysisFailure(
  env: TechnicalAnalysisRuntime,
  media: Pick<TechnicalAnalysisMedia, "id" | "event_id">,
  organizationId: string,
  errorCode: string,
): Promise<void> {
  await saveTechnicalAnalysisFailure({
    organizationId,
    eventId: media.event_id,
    mediaId: media.id,
    modelVersion: TECHNICAL_QUALITY_MODEL_VERSION,
    errorCode,
  }, env.DB).catch(() => undefined);
}

export async function processTechnicalAnalysis(
  mediaId: string,
  organizationId: string,
  env: TechnicalAnalysisRuntime,
): Promise<"completed" | "failed" | "not_found"> {
  const media = await env.DB.prepare(
    `SELECT m.id, m.event_id, m.object_key, m.size_bytes, m.declared_mime, m.created_at
     FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE m.id = ? AND m.status = 'ready' AND e.organization_id = ?`,
  ).bind(mediaId, organizationId).first<TechnicalAnalysisMedia>();
  if (!media) return "not_found";

  try {
    const [inspectionObject, analysisObject] = await Promise.all([
      env.MEDIA.get(media.object_key),
      env.MEDIA.get(media.object_key),
    ]);
    if (!inspectionObject?.body || inspectionObject.size !== media.size_bytes
      || !analysisObject?.body || analysisObject.size !== media.size_bytes) {
      throw new Error("Original image is unavailable");
    }
    const [inspection, analysisResult] = await Promise.all([
      inspectAndChecksum(env.IMAGES, inspectionObject.body, media.declared_mime),
      env.IMAGES.input(analysisObject.body)
        .transform({ width: ANALYSIS_SIZE, height: ANALYSIS_SIZE, fit: "squeeze" })
        .output({ format: "rgba" }),
    ]);
    const analysisBytes = new Uint8Array(await analysisResult.response().arrayBuffer());
    await persistTechnicalAnalysis(env, media, organizationId, inspection, analysisBytes);
    return "completed";
  } catch {
    await recordTechnicalAnalysisFailure(env, media, organizationId, "TECHNICAL_ANALYSIS_FAILED");
    return "failed";
  }
}
