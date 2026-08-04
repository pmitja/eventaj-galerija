import { problem } from "@/lib/http/problem";
import { findPublicEvent } from "@/lib/repositories/events";
import { listPublicVoiceMessages } from "@/lib/repositories/voice-messages";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await findPublicEvent(slug);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const messages = await listPublicVoiceMessages(event.id);
  return Response.json({
    messages: messages.map((message) => ({
      publicId: message.public_id,
      displayName: message.display_name,
      durationMs: message.duration_ms,
      uploadedAt: message.uploaded_at,
      playbackUrl: `/api/v1/events/${encodeURIComponent(slug)}/voice-messages/${message.public_id}/playback`,
    })),
  }, { headers: { "cache-control": "private, no-store, max-age=0" } });
}
