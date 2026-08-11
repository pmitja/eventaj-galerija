import { VIDEO_MAX_BYTES } from "@/lib/domain/billing";
import { areUploadsOpen } from "@/lib/domain/events";
import { problem } from "@/lib/http/problem";
import {
  attachStreamUid,
  findValidUploadSession,
  getVideoUploadPolicy,
  recordUploadConsents,
  rejectMedia,
  reservePendingVideo,
} from "@/lib/repositories/uploads";
import { hashToken } from "@/lib/security/tokens";
import { createTusVideoUpload, deleteStreamVideo } from "@/lib/storage/stream";
import { prepareVideoUploadSchema } from "@/lib/validation/uploads";
import { getCloudflareEnv } from "@/lib/cloudflare";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (String(getCloudflareEnv().VIDEO_UPLOAD_ENABLED) !== "true") {
    return problem(503, "VIDEO_UPLOAD_DISABLED", "Nalaganje videov trenutno še ni vključeno");
  }
  const { token } = await params;
  const session = await findValidUploadSession(await hashToken(token));
  if (!session) return problem(401, "INVALID_UPLOAD_SESSION", "Upload seja ni veljavna");
  if (!areUploadsOpen(session.ends_at)) return problem(410, "EVENT_ENDED", "Nalaganje za ta dogodek je zaključeno");
  const parsed = prepareVideoUploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(422, "INVALID_VIDEO", "Video ni veljaven", parsed.error.issues[0]?.message);

  const policy = await getVideoUploadPolicy(session.event_id);
  if (!policy) return problem(403, "VIDEO_NOT_INCLUDED", "Ta dogodek ne vključuje nalaganja videov");
  if (parsed.data.sizeBytes > Math.min(policy.maxBytes, VIDEO_MAX_BYTES)) {
    return problem(413, "VIDEO_TOO_LARGE", "Video je večji od dovoljenih 500 MB");
  }
  const limit = policy.unlimited ? policy.fairUseCount : policy.includedCount;
  const media = await reservePendingVideo({
    sessionId: session.id,
    eventId: session.event_id,
    filename: parsed.data.filename,
    mime: parsed.data.mime,
    sizeBytes: parsed.data.sizeBytes,
    publicationConsent: parsed.data.publicationConsent,
    limit,
  });
  if (!media) {
    return problem(
      429,
      policy.unlimited ? "VIDEO_FAIR_USE_LIMIT" : "VIDEO_EVENT_LIMIT",
      `Dogodek je dosegel omejitev ${limit} videov`,
    );
  }

  let streamUid: string | null = null;
  try {
    const expiresAt = new Date(Math.min(new Date(session.expires_at).getTime(), Date.now() + 15 * 60 * 1000)).toISOString();
    const directUpload = await createTusVideoUpload({
      fileId: media.id,
      eventId: session.event_id,
      filename: parsed.data.filename,
      sizeBytes: parsed.data.sizeBytes,
      maxDurationSeconds: policy.maxDurationSeconds,
      expiresAt,
    });
    streamUid = directUpload.uid;
    await attachStreamUid(media.id, directUpload.uid);
    await recordUploadConsents({
      eventId: session.event_id,
      sessionId: session.id,
      guestId: session.guest_id,
      mediaId: media.id,
      policyVersion: parsed.data.consentVersion,
      publicationConsent: parsed.data.publicationConsent,
    });
    return Response.json({ fileId: media.id, uploadUrl: directUpload.uploadUrl, protocol: "tus" }, { status: 201 });
  } catch {
    if (streamUid) await deleteStreamVideo(streamUid).catch(() => undefined);
    await rejectMedia(media.id);
    return problem(503, "VIDEO_STORAGE_UNAVAILABLE", "Video storitev trenutno ni dosegljiva");
  }
}
