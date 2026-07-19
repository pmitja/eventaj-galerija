import { z } from "zod";
import { guestIdSchema } from "./guest-identity";

export const createMediaCommentSchema = z.object({
  guestId: guestIdSchema,
  body: z.string().trim().min(1, "Komentar ne sme biti prazen.").max(500, "Komentar ima lahko največ 500 znakov."),
});

export const storedGalleryLikesSchema = z.object({
  version: z.literal(1),
  mediaIds: z.array(z.string().min(1).max(160)).max(500),
});

export type CreateMediaComment = z.infer<typeof createMediaCommentSchema>;
export type StoredGalleryLikes = z.infer<typeof storedGalleryLikesSchema>;
