import { z } from "zod";

export const eventExportParamsSchema = z.object({ eventId: z.uuid() });
export const exportStatusParamsSchema = z.object({ exportId: z.uuid() });
export const exportQueueMessageSchema = z.union([
  z.object({ type: z.literal("build_export"), exportId: z.uuid() }),
  z.object({ type: z.literal("qr_email"), deliveryId: z.uuid() }),
  z.object({
    type: z.literal("archive_email"),
    deliveryId: z.uuid(),
    token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  }),
  exportStatusParamsSchema.transform((value) => ({ type: "build_export" as const, ...value })),
]);
