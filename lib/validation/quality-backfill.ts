import { z } from "zod";

export const qualityBackfillModeSchema = z.enum(["missing", "failed", "all"]);

export const qualityBackfillRequestSchema = z.object({
  mode: qualityBackfillModeSchema.default("missing"),
});

export const qualityBackfillParamsSchema = z.object({ eventId: z.uuid() });

export const qualityBackfillQueueMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("start"),
    backfillId: z.uuid(),
    organizationId: z.string().min(1).max(100),
  }),
  z.object({
    type: z.literal("media"),
    backfillId: z.uuid(),
    mediaId: z.uuid(),
    organizationId: z.string().min(1).max(100),
  }),
]);

export type QualityBackfillQueueMessage = z.infer<typeof qualityBackfillQueueMessageSchema>;
