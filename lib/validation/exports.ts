import { z } from "zod";

export const eventExportParamsSchema = z.object({ eventId: z.uuid() });
export const exportStatusParamsSchema = z.object({ exportId: z.uuid() });
export const exportQueueMessageSchema = exportStatusParamsSchema;
