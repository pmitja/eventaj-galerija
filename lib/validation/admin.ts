import { z } from "zod";

export const adminEventsQuerySchema = z.object({
  q: z.string().trim().max(100).optional().transform((value) => value || undefined),
  status: z.enum(["all", "active", "upcoming", "draft", "ended"]).default("all"),
  period: z.enum(["all", "this_month", "previous_month"]).default("all"),
  sort: z.enum(["date_desc", "date_asc", "name_asc", "name_desc"]).default("date_desc"),
});

export type AdminEventsQuery = z.infer<typeof adminEventsQuerySchema>;

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
