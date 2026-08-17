import { problem } from "@/lib/http/problem";
import { findManagedEvent } from "@/lib/repositories/checkout";
import { managementTokenSchema } from "@/lib/validation/checkout";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { createPresignedDownloadUrl } from "@/lib/storage/r2";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = managementTokenSchema.safeParse((await params).token);
  if (!token.success) return problem(404, "MANAGEMENT_LINK_INVALID", "Management link is invalid");
  const managed = await findManagedEvent(token.data);
  if (!managed) return problem(404, "MANAGEMENT_LINK_INVALID", "Management link is invalid");
  const archive = await getCloudflareEnv().DB.prepare(
    `SELECT de.object_key FROM event_deliveries ed JOIN download_exports de ON de.id = ed.export_id
     WHERE ed.id = ? AND de.status = 'ready' AND de.object_key IS NOT NULL`,
  ).bind(managed.deliveryId).first<{ object_key: string }>();
  if (!archive) return problem(409, "ARCHIVE_NOT_READY", "The ZIP archive is not ready yet");
  return Response.redirect(await createPresignedDownloadUrl(archive.object_key), 302);
}
