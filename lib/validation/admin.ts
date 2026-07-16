import { z } from "zod";

export const adminGalleryQuerySchema = z.object({
  eventId: z.uuid().optional(),
});

