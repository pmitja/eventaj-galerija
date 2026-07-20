import { getCloudflareEnv } from "@/lib/cloudflare";
import { hashDeliveryToken } from "@/lib/domain/delivery";

export type PublicDeliveryDownload = {
  objectKey: string;
  fileName: string;
  expiresAt: string;
};

export async function findPublicDeliveryDownload(token: string, now = new Date()): Promise<PublicDeliveryDownload | null> {
  const tokenHash = await hashDeliveryToken(token);
  const row = await getCloudflareEnv().DB.prepare(
    `SELECT de.object_key, de.file_name, ed.download_expires_at
     FROM event_deliveries ed
     JOIN download_exports de ON de.id = ed.export_id
     WHERE ed.download_token_hash = ? AND ed.archive_email_status = 'sent'
       AND ed.download_expires_at > ? AND de.status = 'ready' AND de.object_key IS NOT NULL`,
  ).bind(tokenHash, now.toISOString()).first<{
    object_key: string;
    file_name: string;
    download_expires_at: string;
  }>();
  return row ? { objectKey: row.object_key, fileName: row.file_name, expiresAt: row.download_expires_at } : null;
}
