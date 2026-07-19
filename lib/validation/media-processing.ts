import { z } from "zod";

export const mediaProcessingQueueMessageSchema = z.object({
  jobId: z.uuid(),
  mediaId: z.uuid(),
  organizationId: z.string().min(1).max(100),
});

export type MediaProcessingQueueMessage = z.infer<typeof mediaProcessingQueueMessageSchema>;
