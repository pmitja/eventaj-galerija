import { z } from "zod";
import { FACE_SEARCH_MAX_FILE_BYTES } from "@/lib/domain/face-search";
import { guestIdSchema } from "@/lib/validation/guest-identity";

export const faceSearchMimeSchema = z.enum(["image/jpeg", "image/png"]);

const faceIndexJobIdSchema = z.union([
  z.uuid(),
  z.string().regex(/^[0-9a-f]{32}$/),
]);

export const createFaceSearchSessionSchema = z.object({
  guestId: guestIdSchema,
  filename: z.string().trim().min(1).max(255),
  mime: faceSearchMimeSchema,
  sizeBytes: z.number().int().positive().max(FACE_SEARCH_MAX_FILE_BYTES),
  consent: z.literal(true),
  policyVersion: z.string().trim().min(1).max(50),
});

export const faceQueueMessageSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("index"),
    jobId: faceIndexJobIdSchema,
    mediaId: z.uuid(),
    organizationId: z.string().min(1).max(100),
  }),
  z.object({
    kind: z.literal("search"),
    sessionId: z.uuid(),
    organizationId: z.string().min(1).max(100),
  }),
]);

export type FaceQueueMessage = z.infer<typeof faceQueueMessageSchema>;
