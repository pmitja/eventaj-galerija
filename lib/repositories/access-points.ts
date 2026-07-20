import { getCloudflareEnv } from "@/lib/cloudflare";
import { createAccessPointRecord, type AccessPointType } from "@/lib/domain/access-points";

export type AccessPointRow = {
  id: string;
  event_id: string;
  public_code: string;
  type: AccessPointType;
  label: string;
  active: number;
  visit_count: number;
  created_at: string;
  updated_at: string;
};

export type AccessPointWithEventRow = AccessPointRow & {
  event_name: string;
  event_slug: string;
  event_status: "draft" | "active" | "ended";
};

export async function createAccessPoint(input: {
  eventId: string;
  label: string;
  type?: AccessPointType;
}, organizationId: string): Promise<AccessPointRow> {
  const point = createAccessPointRecord(input);
  await getCloudflareEnv().DB.prepare(
    `INSERT INTO access_points
      (id, event_id, public_code, type, label, active, created_at, updated_at)
     SELECT ?, ?, ?, ?, ?, 1, ?, ?
     WHERE EXISTS (SELECT 1 FROM events WHERE id = ? AND organization_id = ?)`,
  ).bind(
    point.id,
    point.eventId,
    point.publicCode,
    point.type,
    point.label,
    point.createdAt,
    point.updatedAt,
    point.eventId,
    organizationId,
  ).run();
  return getCloudflareEnv().DB.prepare("SELECT * FROM access_points WHERE id = ?")
    .bind(point.id).first<AccessPointRow>() as Promise<AccessPointRow>;
}

export async function listAccessPoints(organizationId: string): Promise<AccessPointWithEventRow[]> {
  const { DB } = getCloudflareEnv();
  const result = await DB.prepare(
    `SELECT ap.*, e.name AS event_name, e.public_slug AS event_slug, e.status AS event_status
     FROM access_points ap
     JOIN events e ON e.id = ap.event_id
     WHERE e.organization_id = ?
     ORDER BY ap.created_at DESC`,
  ).bind(organizationId).all<AccessPointWithEventRow>();
  return result.results;
}

export async function listEventAccessPoints(eventId: string, organizationId: string): Promise<AccessPointRow[]> {
  const { DB } = getCloudflareEnv();
  const result = await DB.prepare(
    `SELECT ap.* FROM access_points ap JOIN events e ON e.id = ap.event_id
     WHERE ap.event_id = ? AND e.organization_id = ? ORDER BY ap.created_at DESC`,
  ).bind(eventId, organizationId).all<AccessPointRow>();
  return result.results;
}

export async function findActiveAccessPoint(publicCode: string): Promise<AccessPointWithEventRow | null> {
  return getCloudflareEnv().DB.prepare(
    `SELECT ap.*, e.name AS event_name, e.public_slug AS event_slug, e.status AS event_status
     FROM access_points ap
     JOIN events e ON e.id = ap.event_id
     WHERE ap.public_code = ? AND ap.active = 1 AND e.status = 'active'`,
  ).bind(publicCode).first<AccessPointWithEventRow>();
}

export async function recordAccessPointVisit(point: AccessPointRow, referrerHost: string | null): Promise<void> {
  const env = getCloudflareEnv();
  const occurredAt = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO visits (id, event_id, access_point_id, occurred_at, referrer_host) VALUES (?, ?, ?, ?, ?)",
    ).bind(crypto.randomUUID(), point.event_id, point.id, occurredAt, referrerHost),
    env.DB.prepare(
      "UPDATE access_points SET visit_count = visit_count + 1, updated_at = ? WHERE id = ? AND active = 1",
    ).bind(occurredAt, point.id),
  ]);
}
