import { getCloudflareEnv } from "@/lib/cloudflare";
import { createAccessPointRecord } from "@/lib/domain/access-points";
import { createEventRecord } from "@/lib/domain/events";
import type { CreateEventInput } from "@/lib/validation/events";

export type EventRow = {
  id: string;
  public_slug: string;
  name: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: "draft" | "active" | "ended";
  uploads_enabled: number;
  gallery_enabled: number;
  retention_until: string;
  created_at: string;
  updated_at: string;
};

export async function insertEvent(input: CreateEventInput): Promise<EventRow> {
  const event = createEventRecord(input);
  const accessPoint = createAccessPointRecord({ eventId: event.id, label: "Glavna QR koda" });
  const { DB } = getCloudflareEnv();
  await DB.batch([
    DB.prepare(
      `INSERT INTO events
        (id, public_slug, name, location, starts_at, ends_at, timezone, status, retention_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      event.id,
      event.publicSlug,
      event.name,
      event.location || null,
      event.startsAt,
      event.endsAt,
      event.timezone,
      event.status,
      event.retentionUntil,
      event.createdAt,
      event.updatedAt,
    ),
    DB.prepare(
      `INSERT INTO access_points
        (id, event_id, public_code, type, label, active, created_at, updated_at)
       VALUES (?, ?, ?, 'qr', ?, 1, ?, ?)`,
    ).bind(
      accessPoint.id,
      accessPoint.eventId,
      accessPoint.publicCode,
      accessPoint.label,
      accessPoint.createdAt,
      accessPoint.updatedAt,
    ),
  ]);
  return findEventById(event.id) as Promise<EventRow>;
}

export async function findEventById(id: string): Promise<EventRow | null> {
  return getCloudflareEnv().DB.prepare("SELECT * FROM events WHERE id = ?").bind(id).first<EventRow>();
}

export async function findPublicEvent(slug: string): Promise<EventRow | null> {
  return getCloudflareEnv().DB.prepare(
    "SELECT * FROM events WHERE public_slug = ? AND status = 'active' AND gallery_enabled = 1",
  ).bind(slug).first<EventRow>();
}

export async function listEvents(): Promise<EventRow[]> {
  const result = await getCloudflareEnv().DB.prepare(
    "SELECT * FROM events ORDER BY starts_at DESC LIMIT 100",
  ).all<EventRow>();
  return result.results;
}
