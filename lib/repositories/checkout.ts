import { getCloudflareEnv } from "@/lib/cloudflare";
import { createAccessPointRecord } from "@/lib/domain/access-points";
import { checkoutTotalCents } from "@/lib/domain/billing";
import { createEventRecord } from "@/lib/domain/events";
import { hashPassword } from "@/lib/security/password";
import type { AuthContext } from "@/lib/auth/context";
import type { z } from "zod";
import type { createCheckoutSchema } from "@/lib/validation/checkout";
import { createStripeCheckout, retrieveStripeCheckout } from "@/lib/billing/stripe";

type CheckoutInput = z.infer<typeof createCheckoutSchema>;

export type CheckoutOrder = {
  id: string;
  organization_id: string | null;
  existing_user_id: string | null;
  owner_name: string;
  owner_email: string;
  password_hash: string | null;
  organization_name: string;
  event_name: string;
  event_location: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  comments_enabled: number;
  ai_best_photos: number;
  amount_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  status: "pending" | "provisioning" | "provisioned" | "failed" | "expired";
  provisioned_event_id: string | null;
  created_at: string;
  updated_at: string;
};

function organizationSlug(name: string): string {
  const base = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "organizacija";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createCheckoutOrder(input: CheckoutInput, context: AuthContext | null): Promise<{ id: string; url: string }> {
  const env = getCloudflareEnv();
  let ownerName = input.ownerName;
  let ownerEmail = input.ownerEmail;
  let organizationName = input.organizationName;
  let stripeCustomerId: string | null = null;
  let passwordHash: string | null = null;
  if (context) {
    const organization = await env.DB.prepare("SELECT name, stripe_customer_id FROM organizations WHERE id = ? AND status = 'active'")
      .bind(context.organizationId).first<{ name: string; stripe_customer_id: string | null }>();
    if (!organization) throw new Error("ORGANIZATION_NOT_FOUND");
    ownerName = context.name;
    ownerEmail = context.email;
    organizationName = organization.name;
    stripeCustomerId = organization.stripe_customer_id;
  } else {
    if (!input.password) throw new Error("PASSWORD_REQUIRED");
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(ownerEmail).first<{ id: string }>();
    if (existing) throw new Error("ACCOUNT_EXISTS");
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM checkout_orders WHERE owner_email = ? AND created_at > ?",
    ).bind(ownerEmail, new Date(Date.now() - 60 * 60_000).toISOString()).first<{ count: number }>();
    if ((recent?.count ?? 0) >= 3) throw new Error("CHECKOUT_RATE_LIMIT");
    passwordHash = await hashPassword(input.password);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const amount = checkoutTotalCents(input.aiBestPhotos);
  await env.DB.prepare(
    `INSERT INTO checkout_orders
      (id, organization_id, existing_user_id, owner_name, owner_email, password_hash,
       organization_name, event_name, event_location, starts_at, ends_at, timezone,
       comments_enabled, ai_best_photos, amount_cents, currency, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', 'pending', ?, ?)`,
  ).bind(
    id, context?.organizationId ?? null, context?.userId ?? null, ownerName, ownerEmail, passwordHash,
    organizationName, input.eventName, input.eventLocation || null, input.startsAt, input.endsAt,
    input.timezone, input.commentsEnabled ? 1 : 0, input.aiBestPhotos ? 1 : 0, amount, now, now,
  ).run();

  try {
    const root = env.PUBLIC_APP_URL.replace(/\/$/, "");
    const session = await createStripeCheckout({
      orderId: id,
      email: ownerEmail,
      amountCents: amount,
      aiBestPhotos: input.aiBestPhotos,
      successUrl: `${root}/nakup/uspesen?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${root}/naroci?preklicano=1`,
      customerId: stripeCustomerId,
    });
    await env.DB.prepare(
      "UPDATE checkout_orders SET stripe_checkout_session_id = ?, updated_at = ? WHERE id = ? AND status = 'pending'",
    ).bind(session.id, new Date().toISOString(), id).run();
    return { id, url: session.url! };
  } catch (error) {
    await env.DB.prepare(
      "UPDATE checkout_orders SET status = 'failed', password_hash = NULL, error_code = 'STRIPE_CHECKOUT_FAILED', updated_at = ? WHERE id = ?",
    ).bind(new Date().toISOString(), id).run();
    throw error;
  }
}

export async function findCheckoutOrderBySession(sessionId: string): Promise<CheckoutOrder | null> {
  return getCloudflareEnv().DB.prepare("SELECT * FROM checkout_orders WHERE stripe_checkout_session_id = ?")
    .bind(sessionId).first<CheckoutOrder>();
}

export async function expireCheckout(sessionId: string): Promise<void> {
  await getCloudflareEnv().DB.prepare(
    `UPDATE checkout_orders SET status = 'expired', password_hash = NULL, updated_at = ?
     WHERE stripe_checkout_session_id = ? AND status = 'pending'`,
  ).bind(new Date().toISOString(), sessionId).run();
}

export async function fulfillCheckout(sessionId: string): Promise<CheckoutOrder> {
  const env = getCloudflareEnv();
  const session = await retrieveStripeCheckout(sessionId);
  const orderId = session.metadata.orderId;
  const order = await env.DB.prepare("SELECT * FROM checkout_orders WHERE id = ? AND stripe_checkout_session_id = ?")
    .bind(orderId, sessionId).first<CheckoutOrder>();
  if (!order) throw new Error("CHECKOUT_ORDER_NOT_FOUND");
  if (order.status === "provisioned") return order;
  if (session.payment_status !== "paid" || session.amount_total !== order.amount_cents
    || session.currency?.toUpperCase() !== order.currency) throw new Error("CHECKOUT_NOT_PAID");

  const claim = await env.DB.prepare(
    `UPDATE checkout_orders SET status = 'provisioning', updated_at = ?, error_code = NULL
     WHERE id = ? AND (status = 'pending' OR (status = 'provisioning' AND updated_at < ?))`,
  ).bind(new Date().toISOString(), order.id, new Date(Date.now() - 2 * 60_000).toISOString()).run();
  if (claim.meta.changes !== 1) {
    const concurrent = await env.DB.prepare("SELECT * FROM checkout_orders WHERE id = ?").bind(order.id).first<CheckoutOrder>();
    if (concurrent?.status === "provisioned") return concurrent;
    throw new Error("CHECKOUT_PROVISIONING_IN_PROGRESS");
  }

  const now = new Date();
  const event = createEventRecord({
    name: order.event_name,
    location: order.event_location ?? "",
    startsAt: order.starts_at,
    endsAt: order.ends_at,
    timezone: order.timezone,
    customerName: order.owner_name,
    customerEmail: order.owner_email,
    packageCode: "basic",
    commentsEnabled: Boolean(order.comments_enabled),
  }, now);
  const point = createAccessPointRecord({ eventId: event.id, label: "Glavna QR koda", now });
  const organizationId = order.organization_id ?? crypto.randomUUID();
  const userId = order.existing_user_id ?? crypto.randomUUID();
  const existingCustomer = order.organization_id
    ? await env.DB.prepare("SELECT id FROM customers WHERE organization_id = ? AND email = ?")
      .bind(organizationId, order.owner_email).first<{ id: string }>()
    : null;
  const customerId = existingCustomer?.id ?? crypto.randomUUID();
  const timestamp = now.toISOString();

  const statements: D1PreparedStatement[] = [];
  if (!order.organization_id) {
    if (!order.password_hash) throw new Error("CHECKOUT_ACCOUNT_DATA_MISSING");
    statements.push(
      env.DB.prepare(
        `INSERT INTO organizations
          (id, public_id, name, slug, status, billing_email, stripe_customer_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
      ).bind(organizationId, `org_${crypto.randomUUID().replaceAll("-", "")}`, order.organization_name,
        organizationSlug(order.organization_name), order.owner_email, session.customer, timestamp, timestamp),
      env.DB.prepare(
        `INSERT INTO users (id, email, name, password_hash, status, email_verified_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`,
      ).bind(userId, order.owner_email, order.owner_name, order.password_hash, timestamp, timestamp, timestamp),
      env.DB.prepare(
        `INSERT INTO organization_members
          (organization_id, user_id, role, status, joined_at, created_at, updated_at)
         VALUES (?, ?, 'owner', 'active', ?, ?, ?)`,
      ).bind(organizationId, userId, timestamp, timestamp, timestamp),
    );
  } else if (session.customer) {
    statements.push(env.DB.prepare(
      "UPDATE organizations SET stripe_customer_id = COALESCE(stripe_customer_id, ?), updated_at = ? WHERE id = ?",
    ).bind(session.customer, timestamp, organizationId));
  }
  statements.push(
    env.DB.prepare(
      `INSERT INTO customers (id, organization_id, name, email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(organization_id, email) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at`,
    ).bind(customerId, organizationId, order.owner_name, order.owner_email, timestamp, timestamp),
    env.DB.prepare(
      `INSERT INTO events
        (id, organization_id, customer_id, package_id, public_slug, name, location, starts_at, ends_at,
         timezone, status, comments_enabled, retention_until, created_at, updated_at)
       VALUES (?, ?, ?, 'pkg_event_35', ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
    ).bind(event.id, organizationId, customerId, event.publicSlug, event.name, event.location || null,
      event.startsAt, event.endsAt, event.timezone, order.comments_enabled, event.retentionUntil, timestamp, timestamp),
    env.DB.prepare(
      `INSERT INTO access_points (id, event_id, public_code, type, label, active, created_at, updated_at)
       VALUES (?, ?, ?, 'qr', ?, 1, ?, ?)`,
    ).bind(point.id, event.id, point.publicCode, point.label, timestamp, timestamp),
    env.DB.prepare(
      `INSERT INTO event_entitlements (id, event_id, feature_code, value_json, source, source_id, created_at, updated_at)
       VALUES (?, ?, 'ai_best_photos', ?, 'checkout', ?, ?, ?)`,
    ).bind(crypto.randomUUID(), event.id, order.ai_best_photos ? JSON.stringify({ enabled: true, photoLimit: 3000 }) : "false", order.id, timestamp, timestamp),
    env.DB.prepare(
      `INSERT INTO event_entitlements (id, event_id, feature_code, value_json, source, source_id, created_at, updated_at)
       VALUES (?, ?, 'face_collections', 'false', 'checkout', ?, ?, ?)`,
    ).bind(crypto.randomUUID(), event.id, order.id, timestamp, timestamp),
    env.DB.prepare(
      `INSERT INTO audit_logs
        (id, event_id, actor_type, actor_id, action, target_type, target_id, changes_json, created_at)
       VALUES (?, ?, 'system', 'stripe', 'checkout.provisioned', 'event', ?, ?, ?)`,
    ).bind(crypto.randomUUID(), event.id, event.id, JSON.stringify({ orderId: order.id, amountCents: order.amount_cents }), timestamp),
    env.DB.prepare(
      `UPDATE checkout_orders SET status = 'provisioned', organization_id = ?, existing_user_id = ?,
       stripe_payment_intent_id = ?, stripe_customer_id = ?, provisioned_event_id = ?, completed_at = ?, updated_at = ?
       WHERE id = ? AND status = 'provisioning'`,
    ).bind(organizationId, userId, session.payment_intent, session.customer, event.id, timestamp, timestamp, order.id),
  );

  try {
    await env.DB.batch(statements);
  } catch (error) {
    await env.DB.prepare(
      "UPDATE checkout_orders SET status = 'pending', error_code = 'PROVISIONING_FAILED', updated_at = ? WHERE id = ? AND status = 'provisioning'",
    ).bind(new Date().toISOString(), order.id).run();
    throw error;
  }
  return env.DB.prepare("SELECT * FROM checkout_orders WHERE id = ?").bind(order.id).first<CheckoutOrder>() as Promise<CheckoutOrder>;
}
