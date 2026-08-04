import { areUploadsOpen } from "@/lib/domain/events";
import { VOICE_MESSAGE_LIMIT_PER_SESSION } from "@/lib/domain/voice-messages";
import { problem } from "@/lib/http/problem";
import {
  countSessionVoiceMessages,
  createPendingVoiceMessage,
  recordVoiceMessageConsents,
  rejectVoiceMessage,
} from "@/lib/repositories/voice-messages";
import { findValidUploadSession } from "@/lib/repositories/uploads";
import { hashToken } from "@/lib/security/tokens";
import { createPresignedUploadUrl, PRESIGNED_UPLOAD_TTL_SECONDS } from "@/lib/storage/r2";
import { prepareVoiceMessageSchema } from "@/lib/validation/voice-messages";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await findValidUploadSession(await hashToken(token));
  if (!session) return problem(401, "INVALID_UPLOAD_SESSION", "Upload seja ni veljavna");
  if (!areUploadsOpen(session.ends_at)) return problem(410, "EVENT_ENDED", "Nalaganje za ta dogodek je zaključeno");
  if ((await countSessionVoiceMessages(session.id)) >= VOICE_MESSAGE_LIMIT_PER_SESSION) {
    return problem(429, "VOICE_MESSAGE_SESSION_LIMIT", "V tej seji je dosežena omejitev glasovnih voščil");
  }

  const parsed = prepareVoiceMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(422, "INVALID_VOICE_MESSAGE", "Glasovno voščilo ni veljavno", parsed.error.issues[0]?.message);
  }

  const message = await createPendingVoiceMessage({
    sessionId: session.id,
    eventId: session.event_id,
    guestId: session.guest_id,
    mime: parsed.data.mime,
    sizeBytes: parsed.data.sizeBytes,
    durationMs: parsed.data.durationMs,
    publicationConsent: parsed.data.publicationConsent,
  });

  try {
    const uploadUrl = await createPresignedUploadUrl(message.object_key, message.declared_mime);
    await recordVoiceMessageConsents({
      eventId: session.event_id,
      sessionId: session.id,
      guestId: session.guest_id,
      voiceMessageId: message.id,
      policyVersion: parsed.data.consentVersion,
      publicationConsent: parsed.data.publicationConsent,
    });
    return Response.json({
      messageId: message.id,
      uploadUrl,
      expiresAt: new Date(Date.now() + PRESIGNED_UPLOAD_TTL_SECONDS * 1000).toISOString(),
    }, { status: 201 });
  } catch {
    await rejectVoiceMessage(message.id);
    return problem(503, "VOICE_STORAGE_UNAVAILABLE", "Shramba za glasovna voščila trenutno ni dosegljiva");
  }
}
