import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { findSlideshowMediaKey } from "@/lib/repositories/slideshows";
import { hashToken } from "@/lib/security/tokens";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string; publicId: string }> }) {
  const { token, publicId } = await params;
  const key = await findSlideshowMediaKey(await hashToken(token), publicId);
  if (!key) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  const object = await getCloudflareEnv().MEDIA.get(key);
  if (!object?.body) return problem(404, "MEDIA_NOT_FOUND", "Fotografija ne obstaja");
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, no-store, max-age=0");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
