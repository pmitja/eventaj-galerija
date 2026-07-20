import { getAuthContext } from "@/lib/auth/context";
import { problem } from "@/lib/http/problem";
import { findOwnedDownloadExport } from "@/lib/repositories/exports";
import { createPresignedDownloadUrl } from "@/lib/storage/r2";
import { exportStatusParamsSchema } from "@/lib/validation/exports";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ exportId: string }> }) {
  const context = await getAuthContext();
  if (!context) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const parsedParams = exportStatusParamsSchema.safeParse(await params);
  if (!parsedParams.success) return problem(404, "EXPORT_NOT_FOUND", "Izvoz ne obstaja");
  const { exportId } = parsedParams.data;
  const exportJob = await findOwnedDownloadExport(exportId, context.organizationId);
  if (!exportJob) return problem(404, "EXPORT_NOT_FOUND", "Izvoz ne obstaja");

  const expired = Boolean(exportJob.expires_at && exportJob.expires_at <= new Date().toISOString());
  const status = expired ? "expired" : exportJob.status;
  let downloadUrl: string | null = null;
  if (status === "ready" && exportJob.object_key) {
    try {
      downloadUrl = await createPresignedDownloadUrl(exportJob.object_key);
    } catch {
      return problem(503, "EXPORT_SIGNING_UNAVAILABLE", "Povezave za prenos trenutno ni mogoče pripraviti", "Poskusi znova čez nekaj trenutkov.");
    }
  }

  return Response.json({
    export: {
      id: exportJob.id,
      status,
      fileName: exportJob.file_name,
      mediaCount: exportJob.media_count,
      sizeBytes: exportJob.size_bytes,
      expiresAt: exportJob.expires_at,
      downloadUrl,
    },
  }, { headers: { "cache-control": "no-store" } });
}
