import { z } from "zod";
import { CURRENT_UPLOAD_CONSENT_VERSION } from "@/lib/domain/legal";
import { VIDEO_MAX_BYTES } from "@/lib/domain/billing";

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

export const allowedVideoMimes = ["video/mp4", "video/quicktime", "video/webm"] as const;

export const prepareVideoUploadSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  mime: z.enum(allowedVideoMimes),
  sizeBytes: z.number().int().positive().max(VIDEO_MAX_BYTES),
  publicationConsent: z.boolean(),
  termsAccepted: z.literal(true),
  consentVersion: z.literal(CURRENT_UPLOAD_CONSENT_VERSION),
});
