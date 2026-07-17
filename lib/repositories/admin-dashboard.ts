import { getCloudflareEnv } from "@/lib/cloudflare";
import { limitRecentActivity, MAX_RECENT_ACTIVITY, type AdminEventStatus } from "@/lib/domain/admin-dashboard";
import { TECHNICAL_QUALITY_MODEL_VERSION, type QualityCategory } from "@/lib/domain/media-quality";

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
  slideshow_state: "approved" | "hidden";
  uploaded_at: string | null;
  created_at: string;
  quality_category: QualityCategory | null;
  quality_override: QualityCategory | null;
  effective_quality: QualityCategory | null;
  technical_score: number | null;
  analysis_status: "pending" | "completed" | "failed" | null;
  analysis_error_code: string | null;
};

export type AdminMediaFilters = {
  quality?: QualityCategory;
  status?: "ready" | "processing" | "rejected" | "analysis_failed" | "unanalyzed";
  query?: string;
};

export type AdminMediaQualitySummary = {
  total: number;
  ready: number;
  visible: number;
  slideshow_approved: number;
  processing: number;
  failed_analyses: number;
  unanalyzed: number;
  best: number;
  good: number;
  duplicate: number;
  blurry: number;
  low_quality: number;
  total_bytes: number;
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

export type AdminCustomerEvent = {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  event_id: string | null;
  event_name: string | null;
  starts_at: string | null;
  timezone: string | null;
  event_status: AdminEventStatus | null;
  package_name: string | null;
};

type CustomerTotals = {
  customers: number;
  new_customers: number;
  active_galleries: number;
  upcoming_events: number;
};

type AnalyticsTotals = {
  visits: number;
  started_uploads: number;
  completed_uploads: number;
  media: number;
};

export type AnalyticsDay = { day: string; visits: number; uploads: number };
export type AnalyticsSource = { source: string; visits: number };

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
      ) ORDER BY occurred_at DESC LIMIT ?`,
    ).bind(ORGANIZATION_ID, ORGANIZATION_ID, MAX_RECENT_ACTIVITY).all<ActivityRow>(),
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
    activity: limitRecentActivity(activity.results),
    visitsByDay: visitsByDay.results,
  };
}

export async function getAdminCustomersData() {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const [totals, customers] = await Promise.all([
    DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM customers WHERE organization_id = ?) AS customers,
        (SELECT COUNT(*) FROM customers WHERE organization_id = ? AND created_at >= strftime('%Y-%m-01T00:00:00.000Z', 'now')) AS new_customers,
        (SELECT COUNT(*) FROM events WHERE organization_id = ? AND customer_id IS NOT NULL AND status = 'active' AND gallery_enabled = 1) AS active_galleries,
        (SELECT COUNT(*) FROM events WHERE organization_id = ? AND customer_id IS NOT NULL AND status != 'ended'
          AND starts_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
          AND starts_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+30 days')) AS upcoming_events`,
    ).bind(ORGANIZATION_ID, ORGANIZATION_ID, ORGANIZATION_ID, ORGANIZATION_ID).first<CustomerTotals>(),
    DB.prepare(
      `SELECT c.id AS customer_id, c.name AS customer_name, c.email AS customer_email,
              e.id AS event_id, e.name AS event_name, e.starts_at, e.timezone,
              e.status AS event_status, p.name AS package_name
       FROM customers c
       LEFT JOIN events e ON e.customer_id = c.id AND e.organization_id = c.organization_id
       LEFT JOIN packages p ON p.id = e.package_id
       WHERE c.organization_id = ?
       ORDER BY COALESCE(e.starts_at, c.created_at) DESC, c.name ASC
       LIMIT 100`,
    ).bind(ORGANIZATION_ID).all<AdminCustomerEvent>(),
  ]);
  return {
    totals: totals ?? { customers: 0, new_customers: 0, active_galleries: 0, upcoming_events: 0 },
    customers: customers.results,
  };
}

export async function getAdminAnalyticsData() {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const [totals, days, sources] = await Promise.all([
    DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM visits v JOIN events e ON e.id = v.event_id
          WHERE e.organization_id = ? AND v.occurred_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')) AS visits,
        (SELECT COUNT(*) FROM upload_sessions s JOIN events e ON e.id = s.event_id
          WHERE e.organization_id = ? AND s.created_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')) AS started_uploads,
        (SELECT COUNT(DISTINCT m.upload_session_id) FROM media_files m JOIN events e ON e.id = m.event_id
          WHERE e.organization_id = ? AND m.status = 'ready' AND m.created_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')) AS completed_uploads,
        (SELECT COUNT(*) FROM media_files m JOIN events e ON e.id = m.event_id
          WHERE e.organization_id = ? AND m.status = 'ready' AND m.created_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')) AS media`,
    ).bind(ORGANIZATION_ID, ORGANIZATION_ID, ORGANIZATION_ID, ORGANIZATION_ID).first<AnalyticsTotals>(),
    DB.prepare(
      `WITH RECURSIVE days(day) AS (
        SELECT date('now', '-13 days')
        UNION ALL SELECT date(day, '+1 day') FROM days WHERE day < date('now')
      )
      SELECT day,
        (SELECT COUNT(*) FROM visits v JOIN events e ON e.id = v.event_id
          WHERE e.organization_id = ? AND date(v.occurred_at) = day) AS visits,
        (SELECT COUNT(*) FROM upload_sessions s JOIN events e ON e.id = s.event_id
          WHERE e.organization_id = ? AND date(s.created_at) = day) AS uploads
      FROM days ORDER BY day`,
    ).bind(ORGANIZATION_ID, ORGANIZATION_ID).all<AnalyticsDay>(),
    DB.prepare(
      `SELECT COALESCE(ap.type, 'direct') AS source, COUNT(*) AS visits
       FROM visits v
       JOIN events e ON e.id = v.event_id
       LEFT JOIN access_points ap ON ap.id = v.access_point_id
       WHERE e.organization_id = ? AND v.occurred_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')
       GROUP BY COALESCE(ap.type, 'direct')
       ORDER BY visits DESC`,
    ).bind(ORGANIZATION_ID).all<AnalyticsSource>(),
  ]);
  return {
    totals: totals ?? { visits: 0, started_uploads: 0, completed_uploads: 0, media: 0 },
    days: days.results,
    sources: sources.results,
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

export async function listAdminMedia(
  eventId: string,
  filters: AdminMediaFilters = {},
): Promise<AdminMediaSummary[]> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const conditions = ["m.event_id = ?", "e.organization_id = ?"];
  const bindings: Array<string | number> = [eventId, ORGANIZATION_ID];
  if (filters.quality) {
    conditions.push("COALESCE(m.quality_override, m.quality_category) = ?");
    bindings.push(filters.quality);
  }
  if (filters.status === "ready") conditions.push("m.status = 'ready'");
  if (filters.status === "processing") conditions.push("m.status IN ('pending', 'processing')");
  if (filters.status === "rejected") conditions.push("m.status = 'rejected'");
  if (filters.status === "analysis_failed") conditions.push("m.status = 'ready' AND a.status = 'failed'");
  if (filters.status === "unanalyzed") {
    conditions.push("m.status = 'ready' AND (a.status IS NULL OR a.status = 'pending')");
  }
  if (filters.query) {
    conditions.push("m.original_filename LIKE ? ESCAPE '\\'");
    bindings.push(`%${filters.query.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")}%`);
  }
  const result = await DB.prepare(
    `SELECT m.id, m.original_filename, m.declared_mime, m.size_bytes, m.status,
            m.gallery_state, m.slideshow_state, m.uploaded_at, m.created_at,
            m.quality_category, m.quality_override,
            COALESCE(m.quality_override, m.quality_category) AS effective_quality,
            m.technical_score, a.status AS analysis_status, a.error_code AS analysis_error_code
     FROM media_files m JOIN events e ON e.id = m.event_id
     LEFT JOIN ai_analyses a ON a.media_file_id = m.id
       AND a.analysis_type = 'technical_quality' AND a.provider = 'eventaj' AND a.model_version = ?
     WHERE ${conditions.join(" AND ")}
     ORDER BY COALESCE(m.uploaded_at, m.created_at) DESC LIMIT 100`,
  ).bind(TECHNICAL_QUALITY_MODEL_VERSION, ...bindings).all<AdminMediaSummary>();
  return result.results;
}

export async function getAdminMediaQualitySummary(eventId: string): Promise<AdminMediaQualitySummary> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const summary = await DB.prepare(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN m.status = 'ready' THEN 1 ELSE 0 END) AS ready,
       SUM(CASE WHEN m.status = 'ready' AND m.gallery_state = 'visible' THEN 1 ELSE 0 END) AS visible,
       SUM(CASE WHEN m.status = 'ready' AND m.slideshow_state = 'approved' THEN 1 ELSE 0 END) AS slideshow_approved,
       SUM(CASE WHEN m.status IN ('pending', 'processing') THEN 1 ELSE 0 END) AS processing,
       SUM(CASE WHEN m.status = 'ready' AND a.status = 'failed' THEN 1 ELSE 0 END) AS failed_analyses,
       SUM(CASE WHEN m.status = 'ready' AND (a.status IS NULL OR a.status = 'pending') THEN 1 ELSE 0 END) AS unanalyzed,
       SUM(CASE WHEN COALESCE(m.quality_override, m.quality_category) = 'best' THEN 1 ELSE 0 END) AS best,
       SUM(CASE WHEN COALESCE(m.quality_override, m.quality_category) = 'good' THEN 1 ELSE 0 END) AS good,
       SUM(CASE WHEN COALESCE(m.quality_override, m.quality_category) = 'duplicate' THEN 1 ELSE 0 END) AS duplicate,
       SUM(CASE WHEN COALESCE(m.quality_override, m.quality_category) = 'blurry' THEN 1 ELSE 0 END) AS blurry,
       SUM(CASE WHEN COALESCE(m.quality_override, m.quality_category) = 'low_quality' THEN 1 ELSE 0 END) AS low_quality,
       COALESCE(SUM(m.size_bytes), 0) AS total_bytes
     FROM media_files m JOIN events e ON e.id = m.event_id
     LEFT JOIN ai_analyses a ON a.media_file_id = m.id
       AND a.analysis_type = 'technical_quality' AND a.provider = 'eventaj' AND a.model_version = ?
     WHERE m.event_id = ? AND e.organization_id = ?`,
  ).bind(TECHNICAL_QUALITY_MODEL_VERSION, eventId, ORGANIZATION_ID).first<AdminMediaQualitySummary>();
  return summary ?? {
    total: 0,
    ready: 0,
    visible: 0,
    slideshow_approved: 0,
    processing: 0,
    failed_analyses: 0,
    unanalyzed: 0,
    best: 0,
    good: 0,
    duplicate: 0,
    blurry: 0,
    low_quality: 0,
    total_bytes: 0,
  };
}
