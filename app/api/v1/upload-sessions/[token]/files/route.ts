import { problem } from "@/lib/http/problem";
import { areUploadsOpen } from "@/lib/domain/events";
import { countSessionFiles, findValidUploadSession, insertPendingMedia } from "@/lib/repositories/uploads";
import { hashToken } from "@/lib/security/tokens";
import { createPresignedUploadUrl, PRESIGNED_UPLOAD_TTL_SECONDS } from "@/lib/storage/r2";
import { prepareUploadSchema } from "@/lib/validation/uploads";

const MAX_SESSION_FILES = 50;

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await findValidUploadSession(await hashToken(token));
  if (!session) return problem(401, "INVALID_UPLOAD_SESSION", "Upload seja ni veljavna");
  if (!areUploadsOpen(session.ends_at)) {
    return problem(410, "EVENT_ENDED", "Nalaganje za ta dogodek je zaključeno");
  }
  if ((await countSessionFiles(session.id)) >= MAX_SESSION_FILES) {
    return problem(429, "UPLOAD_SESSION_LIMIT", "Doseženo je največje število datotek v seji");
  }
  const parsed = prepareUploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(422, "INVALID_UPLOAD", "Datoteka ni veljavna", parsed.error.issues[0]?.message);

  const fileId = crypto.randomUUID();
  const objectKey = `originals/${session.event_id}/${fileId}/original`;
  let uploadUrl: string;
  try {
    uploadUrl = await createPresignedUploadUrl(objectKey, parsed.data.mime);
  } catch {
    return problem(503, "UPLOAD_STORAGE_UNAVAILABLE", "Shramba za nalaganje trenutno ni dosegljiva");
  }
  const media = await insertPendingMedia({
    sessionId: session.id,
    eventId: session.event_id,
    objectKey,
    filename: parsed.data.filename,
    mime: parsed.data.mime,
    sizeBytes: parsed.data.sizeBytes,
    publicationConsent: parsed.data.publicationConsent,
  });
  return Response.json({
    fileId: media.id,
    uploadUrl,
    expiresAt: new Date(Date.now() + PRESIGNED_UPLOAD_TTL_SECONDS * 1000).toISOString(),
    expiresInSeconds: PRESIGNED_UPLOAD_TTL_SECONDS,
  }, { status: 201 });
}
