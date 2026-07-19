import { z } from "zod";

export const guestIdSchema = z.string().regex(/^guest_[a-f0-9]{16,32}$/);

export const guestIdentitySchema = z.object({
  guestId: guestIdSchema,
  displayName: z.string().trim().min(1).max(40).nullable(),
  showOnLiveScreen: z.boolean(),
});

export const storedGuestIdentitySchema = guestIdentitySchema.extend({ version: z.literal(1) });

export const createUploadSessionSchema = z.object({
  guestId: guestIdSchema.optional(),
});

export type GuestIdentity = z.infer<typeof guestIdentitySchema>;
export type StoredGuestIdentity = z.infer<typeof storedGuestIdentitySchema>;

