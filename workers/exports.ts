import { ZipWriter } from "@zip.js/zip.js";
import { exportExpiry, uniqueWebpEntryNames } from "../lib/domain/exports";
import { exportQueueMessageSchema } from "../lib/validation/exports";

type ExportMessage = { exportId: string };

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
}

type ExportRow = {
  id: string;
  event_id: string;
  status: "queued" | "processing" | "ready" | "failed" | "expired";
  file_name: string;
};

type MediaRow = {
  gallery_key: string;
  original_filename: string;
};

export type ZipSource = {
  name: string;
  body: ReadableStream;
  uploaded: Date;
};

export async function writeZipArchive(output: WritableStream, sources: AsyncIterable<ZipSource>): Promise<void> {
  const writer = new ZipWriter(output, { level: 0, zip64: true, useWebWorkers: false });
  try {
    for await (const source of sources) {
      await writer.add(source.name, source.body, { level: 0, lastModDate: source.uploaded });
    }
    await writer.close();
  } catch (error) {
    await writer.close().catch(() => undefined);
    throw error;
  }
}

async function claimExport(env: Env, exportId: string, retry: boolean): Promise<ExportRow | null> {
  const row = await env.DB.prepare("SELECT id, event_id, status, file_name FROM download_exports WHERE id = ?")
    .bind(exportId).first<ExportRow>();
  if (!row || row.status === "ready" || row.status === "expired") return null;
  if (row.status !== "queued" && !(retry && row.status === "processing")) return null;
  const allowedStatus = row.status;
  const result = await env.DB.prepare(
    "UPDATE download_exports SET status = 'processing', error_code = NULL, updated_at = ? WHERE id = ? AND status = ?",
  ).bind(new Date().toISOString(), exportId, allowedStatus).run();
  return result.meta.changes === 1 ? { ...row, status: "processing" } : null;
}

export async function buildDownloadExport(env: Env, exportId: string, retry = false): Promise<void> {
  const exportJob = await claimExport(env, exportId, retry);
  if (!exportJob) return;

  const media = await env.DB.prepare(
    `SELECT gallery_key, original_filename FROM media_files
     WHERE event_id = ? AND status = 'ready' AND gallery_key IS NOT NULL
     ORDER BY COALESCE(uploaded_at, created_at), id`,
  ).bind(exportJob.event_id).all<MediaRow>();
  if (!media.results.length) throw new Error("EXPORT_EMPTY");

  const objectKey = `exports/${exportJob.event_id}/${exportJob.id}.zip`;
  const zipStream = new TransformStream<Uint8Array, Uint8Array>();
  const upload = env.MEDIA.put(objectKey, zipStream.readable, {
    httpMetadata: {
      contentType: "application/zip",
      contentDisposition: `attachment; filename="${exportJob.file_name}"`,
      cacheControl: "private, no-store",
    },
  });
  const entryNames = uniqueWebpEntryNames(media.results.map((item) => item.original_filename));

  async function* sources(): AsyncGenerator<ZipSource> {
    for (const [index, item] of media.results.entries()) {
      const object = await env.MEDIA.get(item.gallery_key);
      if (!object?.body) throw new Error("EXPORT_SOURCE_MISSING");
      yield { name: entryNames[index], body: object.body, uploaded: object.uploaded };
    }
  }

  try {
    await writeZipArchive(zipStream.writable, sources());
    const stored = await upload;
    const now = new Date();
    await env.DB.prepare(
      `UPDATE download_exports
       SET status = 'ready', object_key = ?, media_count = ?, size_bytes = ?, error_code = NULL,
           expires_at = ?, completed_at = ?, updated_at = ?
       WHERE id = ? AND status = 'processing'`,
    ).bind(
      objectKey, media.results.length, stored.size, exportExpiry(now), now.toISOString(), now.toISOString(), exportJob.id,
    ).run();
  } catch (error) {
    await upload.catch(() => undefined);
    await env.MEDIA.delete(objectKey);
    throw error;
  }
}

function exportErrorCode(error: unknown): string {
  return error instanceof Error && /^[A-Z_]+$/.test(error.message)
    ? error.message
    : "EXPORT_BUILD_FAILED";
}

async function markRetry(env: Env, exportId: string, error: unknown): Promise<void> {
  const errorCode = exportErrorCode(error);
  await env.DB.prepare(
    "UPDATE download_exports SET status = 'queued', error_code = ?, updated_at = ? WHERE id = ? AND status = 'processing'",
  ).bind(errorCode, new Date().toISOString(), exportId).run();
}

async function markFailed(env: Env, exportId: string, error: unknown): Promise<void> {
  const errorCode = exportErrorCode(error);
  await env.DB.prepare(
    "UPDATE download_exports SET status = 'failed', error_code = ?, updated_at = ? WHERE id = ?",
  ).bind(errorCode, new Date().toISOString(), exportId).run();
}

export default {
  async queue(batch: MessageBatch<ExportMessage>, env: Env) {
    for (const message of batch.messages) {
      const parsedMessage = exportQueueMessageSchema.safeParse(message.body);
      if (!parsedMessage.success) {
        console.error(JSON.stringify({ event: "export.invalid_message", messageId: message.id }));
        message.ack();
        continue;
      }
      try {
        await buildDownloadExport(env, parsedMessage.data.exportId, message.attempts > 1);
        message.ack();
      } catch (error) {
        console.error(JSON.stringify({
          event: "export.build_failed",
          exportId: parsedMessage.data.exportId,
          attempt: message.attempts,
          errorCode: exportErrorCode(error),
        }));
        if (message.attempts < 3) {
          await markRetry(env, parsedMessage.data.exportId, error);
          message.retry({ delaySeconds: 30 * message.attempts });
        } else {
          await markFailed(env, parsedMessage.data.exportId, error);
          message.ack();
        }
      }
    }
  },
} satisfies ExportedHandler<Env, ExportMessage>;
