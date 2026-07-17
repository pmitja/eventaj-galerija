import { auth } from "@/auth";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { problem } from "@/lib/http/problem";
import { createDownloadExport, markDownloadExportFailed } from "@/lib/repositories/exports";
import { findEventById } from "@/lib/repositories/events";
import { eventExportParamsSchema } from "@/lib/validation/exports";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth();
  if (!session) return problem(401, "UNAUTHORIZED", "Prijava je obvezna");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return problem(403, "INVALID_ORIGIN", "Izvor zahteve ni dovoljen");
  }

  const parsedParams = eventExportParamsSchema.safeParse(await params);
  if (!parsedParams.success) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");
  const { eventId } = parsedParams.data;
  const event = await findEventById(eventId);
  if (!event) return problem(404, "EVENT_NOT_FOUND", "Dogodek ne obstaja");

  const exportJob = await createDownloadExport({
    eventId,
    eventName: event.name,
    requestedBy: session.user?.email ?? "eventaj-admin",
  });
  if (!exportJob) {
    return problem(422, "EXPORT_EMPTY", "Galerija nima fotografij za izvoz");
  }

  if (exportJob.status === "queued") {
    try {
      await getCloudflareEnv().EXPORT_QUEUE.send({ exportId: exportJob.id });
    } catch {
      await markDownloadExportFailed(exportJob.id, "QUEUE_UNAVAILABLE");
      return problem(503, "EXPORT_QUEUE_UNAVAILABLE", "Izvoza trenutno ni mogoče začeti", "Poskusi znova čez nekaj trenutkov.");
    }
  }

  await getCloudflareEnv().DB.prepare(
    `INSERT INTO audit_logs
      (id, event_id, actor_type, actor_id, action, target_type, target_id, created_at)
     VALUES (?, ?, 'user', ?, 'export.requested', 'download_export', ?, ?)`,
  ).bind(
    crypto.randomUUID(), eventId, session.user?.email ?? "eventaj-admin", exportJob.id, new Date().toISOString(),
  ).run();

  return Response.json({
    export: {
      id: exportJob.id,
      status: exportJob.status,
      fileName: exportJob.file_name,
      mediaCount: exportJob.media_count,
      createdAt: exportJob.created_at,
    },
  }, { status: 202, headers: { "cache-control": "no-store" } });
}
