import { getCloudflareEnv } from "@/lib/cloudflare";
import { hasAllowedVoiceMessageSignature } from "@/lib/domain/voice-messages";
import { problem } from "@/lib/http/problem";
import {
  findVoiceMessageById,
  markVoiceMessageReady,
  rejectVoiceMessage,
} from "@/lib/repositories/voice-messages";
import { findValidUploadSession } from "@/lib/repositories/uploads";
import { hashToken } from "@/lib/security/tokens";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string; messageId: string }> }) {
  const { token, messageId } = await params;
  const session = await findValidUploadSession(await hashToken(token));
  if (!session) return problem(401, "INVALID_UPLOAD_SESSION", "Upload seja ni veljavna");
  const message = await findVoiceMessageById(messageId);
  if (!message || message.upload_session_id !== session.id) {
    return problem(404, "VOICE_MESSAGE_NOT_FOUND", "Glasovno voščilo ne obstaja");
  }
  if (message.status === "ready") return Response.json({ messageId, status: "ready" });
  if (message.status === "rejected") return problem(422, "VOICE_MESSAGE_REJECTED", "Glasovno voščilo je bilo zavrnjeno");

  const env = getCloudflareEnv();
  const [head, prefix] = await Promise.all([
    env.MEDIA.head(message.object_key),
    env.MEDIA.get(message.object_key, { range: { offset: 0, length: 16 } }),
  ]);
  const bytes = prefix?.body ? new Uint8Array(await prefix.arrayBuffer()) : null;
  if (
    !head || head.size !== message.size_bytes ||
    head.httpMetadata?.contentType !== message.declared_mime ||
    !bytes || !hasAllowedVoiceMessageSignature(bytes, message.declared_mime)
  ) {
    await Promise.all([env.MEDIA.delete(message.object_key), rejectVoiceMessage(message.id)]);
    return problem(422, "VOICE_MESSAGE_CONTENT_MISMATCH", "Posnetek se ne ujema s pripravljenim uploadom");
  }

  await markVoiceMessageReady(message.id);
  return Response.json({ messageId, status: "ready" });
}
