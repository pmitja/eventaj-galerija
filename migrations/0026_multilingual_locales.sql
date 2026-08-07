-- Widens the locale CHECK constraints from ('sl','en') to the seven marketing
-- languages. SQLite cannot alter a CHECK in place, so both tables are rebuilt.
-- Data is copied 1:1 and every existing row keeps its current locale value.

PRAGMA defer_foreign_keys = on;

-- events ---------------------------------------------------------------------

CREATE TABLE events_new (
  id TEXT PRIMARY KEY,
  public_slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Ljubljana',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  uploads_enabled INTEGER NOT NULL DEFAULT 1 CHECK (uploads_enabled IN (0, 1)),
  gallery_enabled INTEGER NOT NULL DEFAULT 1 CHECK (gallery_enabled IN (0, 1)),
  retention_until TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT 'eventaj',
  customer_id TEXT REFERENCES customers(id) ON DELETE RESTRICT,
  package_id TEXT REFERENCES packages(id) ON DELETE RESTRICT,
  comments_enabled INTEGER NOT NULL DEFAULT 1 CHECK (comments_enabled IN (0, 1)),
  locale TEXT NOT NULL DEFAULT 'sl'
    CHECK (locale IN ('sl', 'en', 'de', 'nl', 'es', 'it', 'fr'))
);

INSERT INTO events_new (
  id, public_slug, name, location, starts_at, ends_at, timezone, status,
  uploads_enabled, gallery_enabled, retention_until, created_at, updated_at,
  organization_id, customer_id, package_id, comments_enabled, locale
)
SELECT
  id, public_slug, name, location, starts_at, ends_at, timezone, status,
  uploads_enabled, gallery_enabled, retention_until, created_at, updated_at,
  organization_id, customer_id, package_id, comments_enabled, locale
FROM events;

DROP TABLE events;

ALTER TABLE events_new RENAME TO events;

CREATE INDEX events_status_starts_at_idx ON events(status, starts_at);
CREATE INDEX events_retention_until_idx ON events(retention_until);
CREATE INDEX events_organization_status_starts_idx
  ON events(organization_id, status, starts_at);
CREATE INDEX events_organization_customer_idx
  ON events(organization_id, customer_id, starts_at);
CREATE INDEX events_organization_package_idx
  ON events(organization_id, package_id, starts_at);

-- checkout_orders ------------------------------------------------------------

CREATE TABLE checkout_orders_new (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE RESTRICT,
  existing_user_id TEXT REFERENCES users(id) ON DELETE RESTRICT,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  password_hash TEXT,
  organization_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_location TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  timezone TEXT NOT NULL,
  comments_enabled INTEGER NOT NULL DEFAULT 1 CHECK (comments_enabled IN (0, 1)),
  ai_best_photos INTEGER NOT NULL DEFAULT 0 CHECK (ai_best_photos IN (0, 1)),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL CHECK (length(currency) = 3),
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'provisioning', 'provisioned', 'failed', 'expired')),
  provisioned_event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  face_collections INTEGER NOT NULL DEFAULT 0 CHECK (face_collections IN (0, 1)),
  video_unlimited INTEGER NOT NULL DEFAULT 0 CHECK (video_unlimited IN (0, 1)),
  legal_terms_version TEXT,
  locale TEXT NOT NULL DEFAULT 'sl'
    CHECK (locale IN ('sl', 'en', 'de', 'nl', 'es', 'it', 'fr'))
);

INSERT INTO checkout_orders_new (
  id, organization_id, existing_user_id, owner_name, owner_email, password_hash,
  organization_name, event_name, event_location, starts_at, ends_at, timezone,
  comments_enabled, ai_best_photos, amount_cents, currency,
  stripe_checkout_session_id, stripe_payment_intent_id, stripe_customer_id,
  status, provisioned_event_id, error_code, created_at, updated_at, completed_at,
  face_collections, video_unlimited, legal_terms_version, locale
)
SELECT
  id, organization_id, existing_user_id, owner_name, owner_email, password_hash,
  organization_name, event_name, event_location, starts_at, ends_at, timezone,
  comments_enabled, ai_best_photos, amount_cents, currency,
  stripe_checkout_session_id, stripe_payment_intent_id, stripe_customer_id,
  status, provisioned_event_id, error_code, created_at, updated_at, completed_at,
  face_collections, video_unlimited, legal_terms_version, locale
FROM checkout_orders;

DROP TABLE checkout_orders;

ALTER TABLE checkout_orders_new RENAME TO checkout_orders;

CREATE INDEX checkout_orders_email_created_idx
  ON checkout_orders(owner_email, created_at);
CREATE INDEX checkout_orders_status_updated_idx
  ON checkout_orders(status, updated_at);
CREATE INDEX checkout_orders_locale_status_idx
  ON checkout_orders(locale, status, updated_at);
