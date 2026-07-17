import { getCloudflareEnv } from "@/lib/cloudflare";
import { exportFileName } from "@/lib/domain/exports";

export type DownloadExportStatus = "queued" | "processing" | "ready" | "failed" | "expired";

export type DownloadExportRow = {
  id: string;
  event_id: string;
  requested_by: string;
  status: DownloadExportStatus;
  object_key: string | null;
  file_name: string;
  media_count: number;
  size_bytes: number | null;
  error_code: string | null;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function findOwnedDownloadExport(exportId: string): Promise<DownloadExportRow | null> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  return DB.prepare(
    `SELECT de.* FROM download_exports de
     JOIN events e ON e.id = de.event_id
     WHERE de.id = ? AND e.organization_id = ?`,
  ).bind(exportId, ORGANIZATION_ID).first<DownloadExportRow>();
}

export async function findLatestOwnedDownloadExport(eventId: string): Promise<DownloadExportRow | null> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  return DB.prepare(
    `SELECT de.* FROM download_exports de
     JOIN events e ON e.id = de.event_id
     WHERE de.event_id = ? AND e.organization_id = ?
     ORDER BY de.created_at DESC LIMIT 1`,
  ).bind(eventId, ORGANIZATION_ID).first<DownloadExportRow>();
}

export async function createDownloadExport(input: {
  eventId: string;
  eventName: string;
  requestedBy: string;
}): Promise<DownloadExportRow | null> {
  const env = getCloudflareEnv();
  const existing = await env.DB.prepare(
    `SELECT de.* FROM download_exports de
     JOIN events e ON e.id = de.event_id
     WHERE de.event_id = ? AND e.organization_id = ? AND de.status IN ('queued', 'processing')
     ORDER BY de.created_at DESC LIMIT 1`,
  ).bind(input.eventId, env.ORGANIZATION_ID).first<DownloadExportRow>();
  if (existing) return existing;

  const media = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM media_files m
     JOIN events e ON e.id = m.event_id
     WHERE m.event_id = ? AND e.organization_id = ?
       AND m.status = 'ready' AND m.gallery_key IS NOT NULL`,
  ).bind(input.eventId, env.ORGANIZATION_ID).first<{ count: number }>();
  if (!media?.count) return null;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO download_exports
      (id, event_id, requested_by, status, file_name, media_count, created_at, updated_at)
     VALUES (?, ?, ?, 'queued', ?, ?, ?, ?)`,
  ).bind(id, input.eventId, input.requestedBy, exportFileName(input.eventName), media.count, now, now).run();
  return findOwnedDownloadExport(id);
}

export async function markDownloadExportFailed(exportId: string, errorCode: string): Promise<void> {
  await getCloudflareEnv().DB.prepare(
    "UPDATE download_exports SET status = 'failed', error_code = ?, updated_at = ? WHERE id = ? AND status = 'queued'",
  ).bind(errorCode, new Date().toISOString(), exportId).run();
}
