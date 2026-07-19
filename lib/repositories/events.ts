import { getCloudflareEnv } from "@/lib/cloudflare";
import { createAccessPointRecord } from "@/lib/domain/access-points";
import { createEventRecord } from "@/lib/domain/events";
import { packageIncludesFaceCollections } from "@/lib/domain/face-search";
import type { CreateEventInput } from "@/lib/validation/events";

export type EventRow = {
  id: string;
  organization_id: string;
  public_slug: string;
  name: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: "draft" | "active" | "ended";
  uploads_enabled: number;
  gallery_enabled: number;
  comments_enabled: number;
  retention_until: string;
  created_at: string;
  updated_at: string;
  customer_id: string | null;
  package_id: string | null;
};

export async function insertEvent(input: CreateEventInput): Promise<EventRow> {
  const event = createEventRecord(input);
  const accessPoint = createAccessPointRecord({ eventId: event.id, label: "Glavna QR koda" });
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const now = event.createdAt;
  const proposedCustomerId = crypto.randomUUID();
  await DB.prepare(
    `INSERT INTO customers (id, organization_id, name, email, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(organization_id, email) DO UPDATE SET
       name = excluded.name,
       updated_at = excluded.updated_at`,
  ).bind(proposedCustomerId, ORGANIZATION_ID, input.customerName, input.customerEmail, now, now).run();
  const [customer, selectedPackage] = await Promise.all([
    DB.prepare("SELECT id FROM customers WHERE organization_id = ? AND email = ?")
      .bind(ORGANIZATION_ID, input.customerEmail).first<{ id: string }>(),
    DB.prepare("SELECT id, code FROM packages WHERE code = ? AND active = 1")
      .bind(input.packageCode).first<{ id: string; code: string }>(),
  ]);
  if (!customer || !selectedPackage) throw new Error("Customer or package could not be resolved");
  await DB.batch([
    DB.prepare(
      `INSERT INTO events
        (id, organization_id, customer_id, package_id, public_slug, name, location, starts_at, ends_at, timezone, status, comments_enabled, retention_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      event.id,
      ORGANIZATION_ID,
      customer.id,
      selectedPackage.id,
      event.publicSlug,
      event.name,
      event.location || null,
      event.startsAt,
      event.endsAt,
      event.timezone,
      event.status,
      input.commentsEnabled ? 1 : 0,
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
    DB.prepare(
      `INSERT INTO event_entitlements
        (id, event_id, feature_code, value_json, source, source_id, created_at, updated_at)
       VALUES (?, ?, 'face_collections', ?, 'package', ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      event.id,
      packageIncludesFaceCollections(selectedPackage.code) ? "true" : "false",
      selectedPackage.id,
      now,
      now,
    ),
  ]);
  return findEventById(event.id) as Promise<EventRow>;
}

export async function findEventById(id: string): Promise<EventRow | null> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  return DB.prepare("SELECT * FROM events WHERE id = ? AND organization_id = ?")
    .bind(id, ORGANIZATION_ID).first<EventRow>();
}

export async function findPublicEvent(slug: string): Promise<EventRow | null> {
  return getCloudflareEnv().DB.prepare(
    "SELECT * FROM events WHERE public_slug = ? AND status = 'active' AND gallery_enabled = 1",
  ).bind(slug).first<EventRow>();
}

export async function listEvents(): Promise<EventRow[]> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const result = await DB.prepare(
    "SELECT * FROM events WHERE organization_id = ? ORDER BY starts_at DESC LIMIT 100",
  ).bind(ORGANIZATION_ID).all<EventRow>();
  return result.results;
}

export async function updateEventCommentsEnabled(id: string, enabled: boolean): Promise<boolean> {
  const { DB, ORGANIZATION_ID } = getCloudflareEnv();
  const result = await DB.prepare(
    "UPDATE events SET comments_enabled = ?, updated_at = ? WHERE id = ? AND organization_id = ?",
  ).bind(enabled ? 1 : 0, new Date().toISOString(), id, ORGANIZATION_ID).run();
  return (result.meta.changes ?? 0) > 0;
}
