import { z } from "zod";

export const qualityCategorySchema = z.enum(["best", "good", "duplicate", "blurry", "low_quality"]);

export const adminGalleryQuerySchema = z.object({
  eventId: z.uuid().optional(),
  quality: qualityCategorySchema.optional(),
  status: z.enum(["ready", "processing", "processing_failed", "rejected", "analysis_failed", "unanalyzed"]).optional(),
  q: z.string().trim().max(100).optional().transform((value) => value || undefined),
});

export const mediaQualityParamsSchema = z.object({
  eventId: z.uuid(),
  mediaId: z.uuid(),
});

export const mediaQualityOverrideSchema = z.object({
  category: qualityCategorySchema.nullable(),
});
