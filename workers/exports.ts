import { Uint8ArrayReader, ZipWriter } from "@zip.js/zip.js";
import { archiveSchedulingCutoff, createDeliveryToken, hashDeliveryToken } from "../lib/domain/delivery";
import { exportExpiry, exportFileName, uniqueWebpEntryNames } from "../lib/domain/exports";
import { archiveDeliveryEmail, qrDeliveryEmail, ResendEmailAdapter } from "../lib/notifications/email";
import { exportQueueMessageSchema } from "../lib/validation/exports";

type ExportMessage =
  | { type: "build_export"; exportId: string }
  | { type: "qr_email"; deliveryId: string }
  | { type: "archive_email"; deliveryId: string; token: string }
  | { exportId: string };

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  EXPORT_QUEUE: Queue<ExportMessage>;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  PUBLIC_APP_URL: string;
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

type QrDeliveryRow = {
  id: string;
  recipient_email: string;
  qr_email_status: "pending" | "sent" | "failed";
  owner_name: string;
  event_name: string;
  starts_at: string;
  timezone: string;
  public_code: string;
  slideshow_token: string | null;
};

type ArchiveDeliveryRow = {
  id: string;
  recipient_email: string;
  archive_email_status: "pending" | "sent" | "failed";
  download_token_hash: string | null;
  download_expires_at: string | null;
  owner_name: string;
  event_name: string;
  export_status: "ready" | "expired";
  media_count: number;
};

export type ZipSource = {
  name: string;
  // Full bytes of the entry. Providing a known size lets zip.js write the size into the
  // local file header instead of a trailing data descriptor — data descriptors combined
  // with forced zip64 are what made macOS Archive Utility reject the archive (Error 79).
  body: Uint8Array;
  uploaded: Date;
};

export async function writeZipArchive(output: WritableStream, sources: AsyncIterable<ZipSource>): Promise<void> {
  // `zip64` intentionally omitted: zip.js enables it per-entry only when a size or offset
  // actually exceeds 4 GiB, so normal galleries produce a plain zip every tool can open,
  // while multi-GB galleries still get a valid zip64 archive.
  const writer = new ZipWriter(output, { level: 0, useWebWorkers: false });
  try {
    for await (const source of sources) {
      await writer.add(source.name, new Uint8ArrayReader(source.body), { lastModDate: source.uploaded });
    }
    await writer.close();
  } catch (error) {
    await writer.close().catch(() => undefined);
    throw error;
  }
}

// R2 rejects a streaming `put()` whose body has no known Content-Length, so we cannot
// pipe the zip output straight into `MEDIA.put(stream)`. Instead we drive an R2 multipart
// upload from the zip writer: chunks are buffered until they reach the part size and
// uploaded incrementally, keeping memory bounded even for multi-GB galleries.
const R2_MULTIPART_PART_SIZE = 8 * 1024 * 1024; // 8 MiB (R2 requires every non-final part >= 5 MiB)

function concatChunks(chunks: Uint8Array[], totalLength: number): Uint8Array {
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

export async function writeZipToR2Multipart(
  env: Pick<Env, "MEDIA">,
  objectKey: string,
  httpMetadata: R2HTTPMetadata,
  sources: AsyncIterable<ZipSource>,
): Promise<number> {
  const multipart = await env.MEDIA.createMultipartUpload(objectKey, { httpMetadata });
  const parts: R2UploadedPart[] = [];
  let pending: Uint8Array[] = [];
  let pendingBytes = 0;
  let totalBytes = 0;
  let partNumber = 1;

  async function flushPart(): Promise<void> {
    if (pendingBytes === 0) return;
    const body = concatChunks(pending, pendingBytes);
    pending = [];
    pendingBytes = 0;
    parts.push(await multipart.uploadPart(partNumber, body));
    partNumber += 1;
  }

  const sink = new WritableStream<Uint8Array>({
    async write(chunk) {
      pending.push(chunk);
      pendingBytes += chunk.byteLength;
      totalBytes += chunk.byteLength;
      if (pendingBytes >= R2_MULTIPART_PART_SIZE) await flushPart();
    },
    async close() {
      await flushPart();
    },
  });

  try {
    await writeZipArchive(sink, sources);
    await multipart.complete(parts);
    return totalBytes;
  } catch (error) {
    await multipart.abort().catch(() => undefined);
    throw error;
  }
}

function emailAdapter(env: Env): ResendEmailAdapter {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) throw new Error("EMAIL_NOT_CONFIGURED");
  return new ResendEmailAdapter(env.RESEND_API_KEY, env.EMAIL_FROM);
}

function appRoot(env: Env): string {
  return env.PUBLIC_APP_URL.replace(/\/$/, "");
}

function eventDate(value: string, timezone: string): string {
  return new Intl.DateTimeFormat("sl-SI", { dateStyle: "long", timeStyle: "short", timeZone: timezone }).format(new Date(value));
}

async function sendQrDelivery(env: Env, deliveryId: string): Promise<void> {
  const row = await env.DB.prepare(
    `SELECT ed.id, ed.recipient_email, ed.qr_email_status, ed.slideshow_token, co.owner_name,
            e.name AS event_name, e.starts_at, e.timezone, ap.public_code
     FROM event_deliveries ed
     JOIN checkout_orders co ON co.id = ed.checkout_order_id
     JOIN events e ON e.id = ed.event_id
     JOIN access_points ap ON ap.id = ed.access_point_id
     WHERE ed.id = ?`,
  ).bind(deliveryId).first<QrDeliveryRow>();
  if (!row || row.qr_email_status === "sent") return;
  if (!row.slideshow_token) throw new Error("DELIVERY_SLIDESHOW_TOKEN_MISSING");

  const root = appRoot(env);
  await emailAdapter(env).send(qrDeliveryEmail({
    deliveryId: row.id,
    recipientEmail: row.recipient_email,
    recipientName: row.owner_name,
    eventName: row.event_name,
    eventDate: eventDate(row.starts_at, row.timezone),
    qrImageUrl: `${root}/qr/${encodeURIComponent(row.public_code)}.png`,
    eventUrl: `${root}/t/${encodeURIComponent(row.public_code)}`,
    qrDownloadUrl: `${root}/qr/${encodeURIComponent(row.public_code)}.png?download=1`,
    liveshowUrl: `${root}/display/${encodeURIComponent(row.slideshow_token)}`,
  }));
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE event_deliveries SET qr_email_status = 'sent', qr_email_sent_at = ?,
     error_code = NULL, updated_at = ? WHERE id = ? AND qr_email_status != 'sent'`,
  ).bind(now, now, deliveryId).run();
}

async function sendArchiveDelivery(env: Env, deliveryId: string, token: string): Promise<void> {
  const row = await env.DB.prepare(
    `SELECT ed.id, ed.recipient_email, ed.archive_email_status, ed.download_token_hash,
            ed.download_expires_at, co.owner_name, e.name AS event_name,
            de.status AS export_status, de.media_count
     FROM event_deliveries ed
     JOIN checkout_orders co ON co.id = ed.checkout_order_id
     JOIN events e ON e.id = ed.event_id
     JOIN download_exports de ON de.id = ed.export_id
     WHERE ed.id = ?`,
  ).bind(deliveryId).first<ArchiveDeliveryRow>();
  if (!row || row.archive_email_status === "sent") return;
  if (row.export_status !== "ready" || !row.download_expires_at || row.download_expires_at <= new Date().toISOString()) {
    throw new Error("ARCHIVE_NOT_READY");
  }
  if (await hashDeliveryToken(token) !== row.download_token_hash) throw new Error("ARCHIVE_TOKEN_MISMATCH");

  await emailAdapter(env).send(archiveDeliveryEmail({
    deliveryId: row.id,
    recipientEmail: row.recipient_email,
    recipientName: row.owner_name,
    eventName: row.event_name,
    mediaCount: row.media_count,
    downloadUrl: `${appRoot(env)}/prenosi/${encodeURIComponent(token)}`,
    expiresAtLabel: new Intl.DateTimeFormat("sl-SI", {
      dateStyle: "long", timeStyle: "short", timeZone: "Europe/Ljubljana",
    }).format(new Date(row.download_expires_at)),
  }));
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE event_deliveries SET archive_email_status = 'sent', archive_email_sent_at = ?,
     error_code = NULL, updated_at = ? WHERE id = ? AND archive_email_status != 'sent'`,
  ).bind(now, now, deliveryId).run();
}

async function claimExport(env: Env, exportId: string, retry: boolean): Promise<ExportRow | null> {
  const row = await env.DB.prepare("SELECT id, event_id, status, file_name FROM download_exports WHERE id = ?")
    .bind(exportId).first<ExportRow>();
  if (!row || row.status === "ready" || row.status === "expired") return null;
  if (row.status !== "queued" && !(retry && row.status === "processing")) return null;
  const result = await env.DB.prepare(
    "UPDATE download_exports SET status = 'processing', error_code = NULL, updated_at = ? WHERE id = ? AND status = ?",
  ).bind(new Date().toISOString(), exportId, row.status).run();
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
  const entryNames = uniqueWebpEntryNames(media.results.map((item) => item.original_filename));

  async function* sources(): AsyncGenerator<ZipSource> {
    for (const [index, item] of media.results.entries()) {
      const object = await env.MEDIA.get(item.gallery_key);
      if (!object) throw new Error("EXPORT_SOURCE_MISSING");
      // Buffer one gallery file at a time (webp, typically < 1 MiB) so zip.js knows its
      // size up front. Memory stays bounded — the zip output itself streams to R2.
      const body = new Uint8Array(await object.arrayBuffer());
      yield { name: entryNames[index], body, uploaded: object.uploaded };
    }
  }

  const sizeBytes = await writeZipToR2Multipart(env, objectKey, {
    contentType: "application/zip",
    contentDisposition: `attachment; filename="${exportJob.file_name}"`,
    cacheControl: "private, no-store",
  }, sources());

  const now = new Date();
  await env.DB.prepare(
    `UPDATE download_exports
     SET status = 'ready', object_key = ?, media_count = ?, size_bytes = ?, error_code = NULL,
         expires_at = ?, completed_at = ?, updated_at = ?
     WHERE id = ? AND status = 'processing'`,
  ).bind(
    objectKey, media.results.length, sizeBytes, exportExpiry(now), now.toISOString(), now.toISOString(), exportJob.id,
  ).run();
}

async function queueArchiveEmail(env: Env, exportId: string): Promise<void> {
  const delivery = await env.DB.prepare(
    "SELECT id, archive_email_status FROM event_deliveries WHERE export_id = ?",
  ).bind(exportId).first<{ id: string; archive_email_status: string }>();
  if (!delivery || delivery.archive_email_status === "sent") return;
  const token = await createDeliveryToken();
  await env.DB.prepare(
    `UPDATE event_deliveries SET download_token_hash = ?, download_expires_at = ?,
     archive_email_status = 'pending', error_code = NULL, updated_at = ? WHERE id = ?`,
  ).bind(token.hash, token.expiresAt, new Date().toISOString(), delivery.id).run();
  await env.EXPORT_QUEUE.send({ type: "archive_email", deliveryId: delivery.id, token: token.token });
}

export async function scheduleEndedEventExports(env: Env, now = new Date()): Promise<number> {
  const due = await env.DB.prepare(
    `SELECT ed.id AS delivery_id, ed.event_id, e.name AS event_name,
            (SELECT COUNT(*) FROM media_files m
             WHERE m.event_id = e.id AND m.status = 'ready' AND m.gallery_key IS NOT NULL) AS media_count
     FROM event_deliveries ed
     JOIN events e ON e.id = ed.event_id
     WHERE ed.export_id IS NULL AND ed.archive_email_status != 'sent' AND e.ends_at <= ?
     ORDER BY e.ends_at LIMIT 25`,
  ).bind(archiveSchedulingCutoff(now)).all<{ delivery_id: string; event_id: string; event_name: string; media_count: number }>();

  let scheduled = 0;
  for (const row of due.results) {
    await env.DB.prepare("UPDATE events SET status = 'ended', updated_at = ? WHERE id = ? AND status = 'active'")
      .bind(now.toISOString(), row.event_id).run();
    if (!row.media_count) continue;
    const exportId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO download_exports
        (id, event_id, requested_by, status, file_name, media_count, created_at, updated_at)
       VALUES (?, ?, 'event-delivery', 'queued', ?, ?, ?, ?)`,
    ).bind(exportId, row.event_id, exportFileName(row.event_name, now), row.media_count, now.toISOString(), now.toISOString()).run();
    const attached = await env.DB.prepare(
      "UPDATE event_deliveries SET export_id = ?, updated_at = ? WHERE id = ? AND export_id IS NULL",
    ).bind(exportId, now.toISOString(), row.delivery_id).run();
    if (attached.meta.changes !== 1) {
      await env.DB.prepare("DELETE FROM download_exports WHERE id = ? AND status = 'queued'").bind(exportId).run();
      continue;
    }
    await env.EXPORT_QUEUE.send({ type: "build_export", exportId });
    scheduled += 1;
  }
  return scheduled;
}

export async function recoverPendingQrEmails(env: Env): Promise<number> {
  const pending = await env.DB.prepare(
    `SELECT id FROM event_deliveries
     WHERE qr_email_status IN ('pending', 'failed')
     ORDER BY updated_at LIMIT 25`,
  ).all<{ id: string }>();
  for (const delivery of pending.results) {
    await env.EXPORT_QUEUE.send({ type: "qr_email", deliveryId: delivery.id });
  }
  return pending.results.length;
}

export async function recoverFailedArchiveEmails(env: Env): Promise<number> {
  const failed = await env.DB.prepare(
    `SELECT ed.id, ed.export_id FROM event_deliveries ed
     JOIN download_exports de ON de.id = ed.export_id
     WHERE ed.archive_email_status = 'failed' AND de.status = 'ready'
     ORDER BY ed.updated_at LIMIT 25`,
  ).all<{ id: string; export_id: string }>();
  for (const delivery of failed.results) {
    await queueArchiveEmail(env, delivery.export_id);
  }
  return failed.results.length;
}

function errorCode(error: unknown): string {
  return error instanceof Error && /^[A-Z0-9_]+$/.test(error.message)
    ? error.message
    : "DELIVERY_JOB_FAILED";
}

async function markExportRetry(env: Env, exportId: string, error: unknown): Promise<void> {
  await env.DB.prepare(
    "UPDATE download_exports SET status = 'queued', error_code = ?, updated_at = ? WHERE id = ? AND status = 'processing'",
  ).bind(errorCode(error), new Date().toISOString(), exportId).run();
}

async function markJobFailed(env: Env, job: { type: string; exportId?: string; deliveryId?: string }, error: unknown): Promise<void> {
  const code = errorCode(error);
  if (job.exportId) {
    await env.DB.prepare("UPDATE download_exports SET status = 'failed', error_code = ?, updated_at = ? WHERE id = ?")
      .bind(code, new Date().toISOString(), job.exportId).run();
  }
  if (job.deliveryId) {
    const column = job.type === "qr_email" ? "qr_email_status" : "archive_email_status";
    await env.DB.prepare(
      `UPDATE event_deliveries SET ${column} = 'failed', error_code = ?, updated_at = ? WHERE id = ?`,
    ).bind(code, new Date().toISOString(), job.deliveryId).run();
  }
}

export default {
  async queue(batch: MessageBatch<ExportMessage>, env: Env) {
    for (const message of batch.messages) {
      const parsed = exportQueueMessageSchema.safeParse(message.body);
      if (!parsed.success) {
        console.error(JSON.stringify({ event: "delivery.invalid_message", messageId: message.id }));
        message.ack();
        continue;
      }
      const job = parsed.data;
      try {
        if (job.type === "build_export") {
          await buildDownloadExport(env, job.exportId, message.attempts > 1);
          await queueArchiveEmail(env, job.exportId);
        } else if (job.type === "qr_email") {
          await sendQrDelivery(env, job.deliveryId);
        } else {
          await sendArchiveDelivery(env, job.deliveryId, job.token);
        }
        message.ack();
      } catch (error) {
        console.error(JSON.stringify({
          event: "delivery.job_failed",
          type: job.type,
          attempt: message.attempts,
          errorCode: errorCode(error),
          errorName: error instanceof Error ? error.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        }));
        // Never let bookkeeping failures escape the handler — an uncaught throw here
        // leaves the export stuck in `processing` with no error recorded.
        try {
          if (message.attempts < 3) {
            if (job.type === "build_export") await markExportRetry(env, job.exportId, error);
            message.retry({ delaySeconds: 30 * message.attempts });
          } else {
            await markJobFailed(env, job, error);
            message.ack();
          }
        } catch (bookkeepingError) {
          console.error(JSON.stringify({
            event: "delivery.bookkeeping_failed",
            type: job.type,
            errorMessage: bookkeepingError instanceof Error ? bookkeepingError.message : String(bookkeepingError),
            errorStack: bookkeepingError instanceof Error ? bookkeepingError.stack : undefined,
          }));
          message.retry({ delaySeconds: 30 * message.attempts });
        }
      }
    }
  },

  async scheduled(_controller: ScheduledController, env: Env, context: ExecutionContext) {
    context.waitUntil(Promise.all([
      recoverPendingQrEmails(env),
      recoverFailedArchiveEmails(env),
      scheduleEndedEventExports(env),
    ]));
  },
} satisfies ExportedHandler<Env, ExportMessage>;
