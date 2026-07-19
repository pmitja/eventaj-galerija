import { getCloudflareEnv } from "@/lib/cloudflare";
import {
  CONTRIBUTOR_MILESTONES,
  EVENT_PHOTO_MILESTONES,
  GUEST_PHOTO_MILESTONES,
  reachedMilestones,
} from "@/lib/domain/guest-identity";

const ACCEPTED_QUALITY = "COALESCE(m.quality_override, m.quality_category) IN ('best', 'good')";

type AcceptedMediaContext = {
  event_id: string;
  upload_session_id: string;
  guest_id: string | null;
};

async function insertEvent(database: D1Database, input: {
  eventId: string;
  guestId?: string | null;
  uploadSessionId?: string | null;
  type: "upload_accepted" | "guest_milestone" | "leader_changed" | "photo_total_milestone" | "contributor_total_milestone";
  count: number;
  dedupeKey: string;
  createdAt: string;
}) {
  await database.prepare(
    `INSERT OR IGNORE INTO engagement_events
      (id, event_id, guest_id, upload_session_id, type, count, dedupe_key, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(), input.eventId, input.guestId ?? null, input.uploadSessionId ?? null,
    input.type, input.count, input.dedupeKey, input.createdAt,
  ).run();
}

export async function recordAcceptedEngagement(mediaId: string, database: D1Database): Promise<void> {
  const context = await database.prepare(
    `SELECT m.event_id, m.upload_session_id, s.guest_id
     FROM media_files m JOIN upload_sessions s ON s.id = m.upload_session_id
     WHERE m.id = ? AND m.status = 'ready' AND ${ACCEPTED_QUALITY}`,
  ).bind(mediaId).first<AcceptedMediaContext>();
  if (!context) return;

  const now = new Date().toISOString();
  await insertEvent(database, {
    eventId: context.event_id,
    guestId: context.guest_id,
    uploadSessionId: context.upload_session_id,
    type: "upload_accepted",
    count: 1,
    dedupeKey: `accepted:${mediaId}`,
    createdAt: now,
  });

  const totals = await database.prepare(
    `SELECT COUNT(*) AS photos,
      COUNT(DISTINCT CASE WHEN s.guest_id IS NOT NULL THEN s.guest_id END) AS contributors
     FROM media_files m JOIN upload_sessions s ON s.id = m.upload_session_id
     WHERE m.event_id = ? AND m.status = 'ready' AND ${ACCEPTED_QUALITY}`,
  ).bind(context.event_id).first<{ photos: number; contributors: number }>();

  for (const threshold of reachedMilestones(totals?.photos ?? 0, EVENT_PHOTO_MILESTONES)) {
    await insertEvent(database, {
      eventId: context.event_id, type: "photo_total_milestone", count: threshold,
      dedupeKey: `event:photos:${threshold}`, createdAt: now,
    });
  }
  for (const threshold of reachedMilestones(totals?.contributors ?? 0, CONTRIBUTOR_MILESTONES)) {
    await insertEvent(database, {
      eventId: context.event_id, type: "contributor_total_milestone", count: threshold,
      dedupeKey: `event:contributors:${threshold}`, createdAt: now,
    });
  }

  if (!context.guest_id) return;
  const guestTotal = await database.prepare(
    `SELECT COUNT(*) AS count FROM media_files m
     JOIN upload_sessions s ON s.id = m.upload_session_id
     WHERE m.event_id = ? AND s.guest_id = ? AND m.status = 'ready' AND ${ACCEPTED_QUALITY}`,
  ).bind(context.event_id, context.guest_id).first<{ count: number }>();
  for (const threshold of reachedMilestones(guestTotal?.count ?? 0, GUEST_PHOTO_MILESTONES)) {
    await insertEvent(database, {
      eventId: context.event_id, guestId: context.guest_id, type: "guest_milestone", count: threshold,
      dedupeKey: `guest:${context.guest_id}:photos:${threshold}`, createdAt: now,
    });
  }

  const leader = await database.prepare(
    `SELECT s.guest_id, COUNT(*) AS count FROM media_files m
     JOIN upload_sessions s ON s.id = m.upload_session_id
     JOIN event_guests g ON g.id = s.guest_id AND g.event_id = m.event_id
     WHERE m.event_id = ? AND m.status = 'ready' AND g.show_on_live_screen = 1 AND ${ACCEPTED_QUALITY}
     GROUP BY s.guest_id ORDER BY count DESC, MIN(m.quality_accepted_at) ASC, s.guest_id ASC LIMIT 1`,
  ).bind(context.event_id).first<{ guest_id: string; count: number }>();
  if (!leader) return;
  const previous = await database.prepare(
    "SELECT leader_guest_id FROM event_engagement_state WHERE event_id = ?",
  ).bind(context.event_id).first<{ leader_guest_id: string | null }>();
  await database.prepare(
    `INSERT INTO event_engagement_state (event_id, leader_guest_id, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(event_id) DO UPDATE SET leader_guest_id = excluded.leader_guest_id, updated_at = excluded.updated_at`,
  ).bind(context.event_id, leader.guest_id, now).run();
  if (previous?.leader_guest_id && previous.leader_guest_id !== leader.guest_id) {
    await insertEvent(database, {
      eventId: context.event_id, guestId: leader.guest_id, type: "leader_changed", count: leader.count,
      dedupeKey: `leader:${leader.guest_id}:${leader.count}`, createdAt: now,
    });
  }
}

export type EngagementSnapshot = {
  leaderboard: Array<{ guestId: string; displayName: string; count: number }>;
  stats: { acceptedPhotos: number; contributors: number };
  events: Array<{
    id: string;
    type: "upload_accepted" | "guest_milestone" | "leader_changed" | "photo_total_milestone" | "contributor_total_milestone";
    guestId: string | null;
    displayName: string | null;
    uploadSessionId: string | null;
    count: number;
    createdAt: string;
  }>;
};

export async function getEngagementSnapshot(eventId: string): Promise<EngagementSnapshot> {
  const DB = getCloudflareEnv().DB;
  const [leaders, stats, events] = await Promise.all([
    DB.prepare(
      `SELECT g.id AS guest_id, g.display_name, COUNT(*) AS count
       FROM media_files m JOIN upload_sessions s ON s.id = m.upload_session_id
       JOIN event_guests g ON g.id = s.guest_id AND g.event_id = m.event_id
       WHERE m.event_id = ? AND m.status = 'ready' AND g.show_on_live_screen = 1
         AND g.display_name IS NOT NULL AND ${ACCEPTED_QUALITY}
       GROUP BY g.id, g.display_name
       ORDER BY count DESC, MIN(m.quality_accepted_at) ASC, g.id ASC LIMIT 10`,
    ).bind(eventId).all<{ guest_id: string; display_name: string; count: number }>(),
    DB.prepare(
      `SELECT COUNT(*) AS photos,
        COUNT(DISTINCT CASE WHEN s.guest_id IS NOT NULL THEN s.guest_id END) AS contributors
       FROM media_files m JOIN upload_sessions s ON s.id = m.upload_session_id
       WHERE m.event_id = ? AND m.status = 'ready' AND ${ACCEPTED_QUALITY}`,
    ).bind(eventId).first<{ photos: number; contributors: number }>(),
    DB.prepare(
      `SELECT ee.id, ee.type, ee.guest_id, ee.upload_session_id, ee.count, ee.created_at,
              CASE WHEN g.show_on_live_screen = 1 THEN g.display_name ELSE NULL END AS display_name
       FROM engagement_events ee LEFT JOIN event_guests g ON g.id = ee.guest_id AND g.event_id = ee.event_id
       WHERE ee.event_id = ? AND ee.created_at >= ?
         AND (ee.guest_id IS NULL OR (g.show_on_live_screen = 1 AND g.display_name IS NOT NULL))
       ORDER BY ee.created_at ASC LIMIT 100`,
    ).bind(eventId, new Date(Date.now() - 5 * 60 * 1000).toISOString()).all<{
      id: string; type: EngagementSnapshot["events"][number]["type"]; guest_id: string | null;
      display_name: string | null; upload_session_id: string | null; count: number; created_at: string;
    }>(),
  ]);
  return {
    leaderboard: leaders.results.map((row) => ({ guestId: row.guest_id, displayName: row.display_name, count: row.count })),
    stats: { acceptedPhotos: stats?.photos ?? 0, contributors: stats?.contributors ?? 0 },
    events: events.results.map((row) => ({
      id: row.id, type: row.type, guestId: row.guest_id, displayName: row.display_name,
      uploadSessionId: row.upload_session_id, count: row.count, createdAt: row.created_at,
    })),
  };
}
