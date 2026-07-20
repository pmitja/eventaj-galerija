PRAGMA foreign_keys = ON;

-- Additive migration. Existing rows remain owned by the legacy `eventaj`
-- organization and older application versions ignore the new tables.
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  billing_email TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO organizations
  (id, public_id, name, slug, status, billing_email, created_at, updated_at)
VALUES
  ('eventaj', 'org_eventaj', 'Eventaj.si', 'eventaj', 'active', 'info@eventaj.si',
   strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  email_verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE organization_members (
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'event_manager')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  joined_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX organization_members_user_status_idx
  ON organization_members(user_id, status, organization_id);

CREATE TABLE checkout_orders (
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
  completed_at TEXT
);

CREATE INDEX checkout_orders_email_created_idx
  ON checkout_orders(owner_email, created_at);
CREATE INDEX checkout_orders_status_updated_idx
  ON checkout_orders(status, updated_at);

INSERT INTO packages
  (id, code, name, active, base_price_cents, currency, default_retention_days)
VALUES
  ('pkg_event_35', 'event_35', 'Eventaj Galerija', 1, 3500, 'EUR', 90);
