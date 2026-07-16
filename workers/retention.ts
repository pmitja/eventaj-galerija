interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
}

async function deletePrefix(bucket: R2Bucket, prefix: string): Promise<void> {
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000 });
    if (page.objects.length > 0) await bucket.delete(page.objects.map((object) => object.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}

async function deleteExpiredEvents(env: Env): Promise<void> {
  const expired = await env.DB.prepare(
    "SELECT id FROM events WHERE retention_until <= ? ORDER BY retention_until LIMIT 25",
  ).bind(new Date().toISOString()).all<{ id: string }>();

  for (const event of expired.results) {
    await deletePrefix(env.MEDIA, `originals/${event.id}/`);
    await deletePrefix(env.MEDIA, `derived/${event.id}/`);
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO audit_logs
          (id, event_id, actor_type, action, target_type, target_id, created_at)
         VALUES (?, ?, 'system', 'retention.deleted', 'event', ?, ?)`,
      ).bind(crypto.randomUUID(), event.id, event.id, now),
      env.DB.prepare("DELETE FROM events WHERE id = ? AND retention_until <= ?").bind(event.id, now),
    ]);
  }
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, context: ExecutionContext) {
    context.waitUntil(deleteExpiredEvents(env));
  },
} satisfies ExportedHandler<Env>;
