import { getCloudflareContext } from "@opennextjs/cloudflare";
import { problem } from "@/lib/http/problem";
import { findMediaById, findValidUploadSession, markMediaProcessing, rejectMedia } from "@/lib/repositories/uploads";
import { hashToken } from "@/lib/security/tokens";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { processImage } from "@/lib/storage/r2";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string; fileId: string }> }) {
  const { token, fileId } = await params;
  const session = await findValidUploadSession(await hashToken(token));
  if (!session) return problem(401, "INVALID_UPLOAD_SESSION", "Upload seja ni veljavna");
  const media = await findMediaById(fileId);
  if (!media || media.upload_session_id !== session.id) return problem(404, "FILE_NOT_FOUND", "Datoteka ne obstaja");
  if (media.status === "ready" || media.status === "processing") {
    return Response.json({ fileId, status: media.status }, { status: 202 });
  }
  if (media.status === "rejected") return problem(422, "UPLOAD_REJECTED", "Datoteka je bila zavrnjena");

  const object = await getCloudflareEnv().MEDIA.head(media.object_key);
  if (
    !object ||
    object.size !== media.size_bytes ||
    object.httpMetadata?.contentType !== media.declared_mime
  ) {
    await getCloudflareEnv().MEDIA.delete(media.object_key);
    await rejectMedia(media.id);
    return problem(422, "UPLOAD_METADATA_MISMATCH", "Naložena datoteka se ne ujema s pripravljenim uploadom");
  }
  if (!(await markMediaProcessing(media.id))) {
    return Response.json({ fileId, status: "processing" }, { status: 202 });
  }
  getCloudflareContext().ctx.waitUntil(processImage(media.id));
  return Response.json({ fileId, status: "processing" }, { status: 202 });
}
