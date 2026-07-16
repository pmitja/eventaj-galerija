import { z } from "zod";

export const allowedImageMimes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"] as const;
// Cloudflare Images binding accepts input streams up to 20 MB.
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export const prepareUploadSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  mime: z.enum(allowedImageMimes),
  sizeBytes: z.number().int().positive().max(MAX_IMAGE_BYTES),
  publicationConsent: z.boolean(),
});

export const completeUploadSchema = z.object({
  fileId: z.uuid(),
});
