import { getCloudflareEnv } from "@/lib/cloudflare";
import { VIDEO_MAX_DURATION_SECONDS } from "@/lib/domain/billing";
import { problem } from "@/lib/http/problem";
import { deleteStreamVideo, verifyStreamWebhook } from "@/lib/storage/stream";

type StreamWebhook = {
  uid?: string;
  duration?: number;
  thumbnail?: string;
  readyToStream?: boolean;
  status?: { state?: string; errorReasonCode?: string };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!await verifyStreamWebhook(rawBody, request.headers.get("webhook-signature"))) {
    return problem(401, "INVALID_WEBHOOK_SIGNATURE", "Webhook podpis ni veljaven");
  }
  let payload: StreamWebhook;
  try {
    payload = JSON.parse(rawBody) as StreamWebhook;
  } catch {
    return problem(400, "INVALID_WEBHOOK", "Webhook vsebina ni veljavna");
  }
  if (!payload.uid) return problem(400, "INVALID_WEBHOOK", "Webhook nima video identifikatorja");
  const env = getCloudflareEnv();
  const media = await env.DB.prepare(
    "SELECT id, event_id, status FROM media_files WHERE stream_uid = ? AND kind = 'video'",
  ).bind(payload.uid).first<{ id: string; event_id: string; status: string }>();
  if (!media) return Response.json({ received: true });

  const durationMs = payload.duration ? Math.round(payload.duration * 1000) : null;
  if ((payload.duration ?? 0) > VIDEO_MAX_DURATION_SECONDS) {
    await deleteStreamVideo(payload.uid).catch(() => undefined);
    await env.DB.prepare(
      "UPDATE media_files SET status = 'rejected', processing_error_code = 'duration_limit' WHERE id = ?",
    ).bind(media.id).run();
    return Response.json({ received: true });
  }
  if (payload.readyToStream || payload.status?.state === "ready") {
    let posterKey: string | null = null;
    if (payload.thumbnail) {
      try {
        const token = await env.STREAM.video(payload.uid).generateToken();
        const posterResponse = await fetch(payload.thumbnail.replace(payload.uid, token));
        if (posterResponse.ok && posterResponse.body) {
          posterKey = `derived/${media.event_id}/${media.id}/video-poster.jpg`;
          await env.MEDIA.put(posterKey, posterResponse.body, { httpMetadata: { contentType: "image/jpeg" } });
        }
      } catch {
        // Playback remains available; a later webhook can retry poster storage.
      }
    }
    await env.DB.prepare(
      `UPDATE media_files SET status = 'ready', duration_ms = ?, poster_key = COALESCE(?, poster_key),
       uploaded_at = COALESCE(uploaded_at, ?), processing_error_code = NULL
       WHERE id = ? AND kind = 'video' AND status IN ('pending', 'processing', 'ready')`,
    ).bind(durationMs, posterKey, new Date().toISOString(), media.id).run();
  } else if (payload.status?.state === "error") {
    await env.DB.prepare(
      "UPDATE media_files SET status = 'rejected', processing_error_code = ? WHERE id = ? AND kind = 'video'",
    ).bind(payload.status.errorReasonCode ?? "stream_processing_failed", media.id).run();
  }
  return Response.json({ received: true });
}
