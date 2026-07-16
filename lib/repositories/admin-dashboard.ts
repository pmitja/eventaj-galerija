import { getCloudflareEnv } from "@/lib/cloudflare";
import type { AdminEventStatus } from "@/lib/domain/admin-dashboard";

export type AdminEventSummary = {
  id: string;
  public_slug: string;
  name: string;
  location: string | null;
  starts_at: string;
  timezone: string;
  status: AdminEventStatus;
  photo_count: number;
  visit_count: number;
  is_upcoming: number;
};

export type AdminMediaSummary = {
  id: string;
  original_filename: string;
  declared_mime: string;
  size_bytes: number;
  status: "pending" | "processing" | "ready" | "rejected";
  gallery_state: "visible" | "hidden";
  uploaded_at: string | null;
  created_at: string;
};

type DashboardTotals = {
  active_events: number;
  photos: number;
  visits: number;
  pending_moderation: number;
  generated_at: string;
};

type ActivityRow = {
  kind: "media" | "event";
  event_name: string;
  occurred_at: string;
  filename: string | null;
};

type VisitDay = { day: string; visits: number };

export async function getAdminDashboardData() {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const [totals, events, activity, visitsByDay] = await Promise.all([
    DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM events WHERE organization_id = ? AND status = 'active') AS active_events,
        (SELECT COUNT(*) FROM media_files m JOIN events e ON e.id = m.event_id WHERE e.organization_id = ? AND m.status = 'ready') AS photos,
        (SELECT COUNT(*) FROM visits v JOIN events e ON e.id = v.event_id WHERE e.organization_id = ?) AS visits,
        (SELECT COUNT(*) FROM media_files m JOIN events e ON e.id = m.event_id WHERE e.organization_id = ? AND m.status = 'ready' AND m.gallery_state = 'hidden') AS pending_moderation,
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AS generated_at`,
    ).bind(ORGANIZATION_ID, ORGANIZATION_ID, ORGANIZATION_ID, ORGANIZATION_ID).first<DashboardTotals>(),
    listAdminEventSummaries(3),
    DB.prepare(
      `SELECT kind, event_name, occurred_at, filename FROM (
        SELECT 'media' AS kind, e.name AS event_name, COALESCE(m.uploaded_at, m.created_at) AS occurred_at,
               m.original_filename AS filename
        FROM media_files m JOIN events e ON e.id = m.event_id
        WHERE e.organization_id = ?
        UNION ALL
        SELECT 'event' AS kind, e.name AS event_name, e.created_at AS occurred_at, NULL AS filename
        FROM events e WHERE e.organization_id = ?
      ) ORDER BY occurred_at DESC LIMIT 5`,
    ).bind(ORGANIZATION_ID, ORGANIZATION_ID).all<ActivityRow>(),
    DB.prepare(
      `WITH RECURSIVE days(day) AS (
        SELECT date('now', '-13 days')
        UNION ALL SELECT date(day, '+1 day') FROM days WHERE day < date('now')
      )
      SELECT days.day, COUNT(v.id) AS visits
      FROM days
      LEFT JOIN events e ON e.organization_id = ?
      LEFT JOIN visits v ON v.event_id = e.id AND date(v.occurred_at) = days.day
      GROUP BY days.day ORDER BY days.day`,
    ).bind(ORGANIZATION_ID).all<VisitDay>(),
  ]);

  return {
    totals: totals ?? { active_events: 0, photos: 0, visits: 0, pending_moderation: 0, generated_at: "1970-01-01T00:00:00.000Z" },
    events,
    activity: activity.results,
    visitsByDay: visitsByDay.results,
  };
}

export async function listAdminEventSummaries(limit = 100): Promise<AdminEventSummary[]> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const result = await DB.prepare(
    `SELECT e.id, e.public_slug, e.name, e.location, e.starts_at, e.timezone, e.status,
      CASE WHEN e.status != 'ended' AND e.starts_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now') THEN 1 ELSE 0 END AS is_upcoming,
      (SELECT COUNT(*) FROM media_files m WHERE m.event_id = e.id AND m.status = 'ready') AS photo_count,
      (SELECT COUNT(*) FROM visits v WHERE v.event_id = e.id) AS visit_count
     FROM events e WHERE e.organization_id = ?
     ORDER BY e.starts_at DESC LIMIT ?`,
  ).bind(ORGANIZATION_ID, limit).all<AdminEventSummary>();
  return result.results;
}

export async function listAdminMedia(eventId: string): Promise<AdminMediaSummary[]> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const result = await DB.prepare(
    `SELECT m.id, m.original_filename, m.declared_mime, m.size_bytes, m.status,
            m.gallery_state, m.uploaded_at, m.created_at
     FROM media_files m JOIN events e ON e.id = m.event_id
     WHERE m.event_id = ? AND e.organization_id = ?
     ORDER BY COALESCE(m.uploaded_at, m.created_at) DESC LIMIT 100`,
  ).bind(eventId, ORGANIZATION_ID).all<AdminMediaSummary>();
  return result.results;
}
