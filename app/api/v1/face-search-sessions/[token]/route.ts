import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import {
  findFaceSearchSessionByTokenHash,
  listFaceSearchMatches,
  withdrawFaceSearchSession,
} from "@/lib/repositories/face-search";
import { hashToken } from "@/lib/security/tokens";

export const dynamic = "force-dynamic";

async function sessionForToken(token: string) {
  return findFaceSearchSessionByTokenHash(await hashToken(token));
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await sessionForToken(token);
  if (!session) return problem(401, "INVALID_FACE_SEARCH_SESSION", "Iskalna seja ni veljavna");
  const expired = new Date(session.expires_at).getTime() <= Date.now() && !["completed", "failed", "withdrawn"].includes(session.status);
  const status = expired ? "expired" : session.status;
  const matches = status === "completed" ? await listFaceSearchMatches(session) : [];
  return Response.json({
    status,
    errorCode: session.error_code,
    expiresAt: session.expires_at,
    media: matches.map((item) => ({
      publicId: item.public_id,
      filename: item.original_filename,
      similarity: item.similarity,
      commentCount: item.comment_count,
      thumbnailUrl: `/api/v1/events/${session.public_slug}/media/${item.public_id}?variant=thumbnail`,
      imageUrl: `/api/v1/events/${session.public_slug}/media/${item.public_id}?variant=gallery`,
    })),
  }, { headers: { "cache-control": "private, no-store, max-age=0" } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await sessionForToken(token);
  if (!session) return problem(401, "INVALID_FACE_SEARCH_SESSION", "Iskalna seja ni veljavna");
  if (session.selfie_object_key) await getCloudflareEnv().MEDIA.delete(session.selfie_object_key);
  await withdrawFaceSearchSession(session);
  return new Response(null, { status: 204 });
}
