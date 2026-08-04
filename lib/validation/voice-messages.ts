import { z } from "zod";
import { CURRENT_UPLOAD_CONSENT_VERSION } from "@/lib/domain/legal";
import {
  allowedVoiceMessageMimes,
  VOICE_MESSAGE_MAX_BYTES,
  VOICE_MESSAGE_MAX_DURATION_MS,
  VOICE_MESSAGE_MIN_DURATION_MS,
} from "@/lib/domain/voice-messages";

export const prepareVoiceMessageSchema = z.object({
  mime: z.enum(allowedVoiceMessageMimes),
  sizeBytes: z.number().int().positive().max(VOICE_MESSAGE_MAX_BYTES),
  durationMs: z.number().int().min(VOICE_MESSAGE_MIN_DURATION_MS).max(VOICE_MESSAGE_MAX_DURATION_MS),
  publicationConsent: z.boolean(),
  termsAccepted: z.literal(true),
  consentVersion: z.literal(CURRENT_UPLOAD_CONSENT_VERSION),
});
