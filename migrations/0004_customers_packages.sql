PRAGMA foreign_keys = ON;

-- Additive migration: existing events remain valid with NULL customer_id and
-- package_id. New events created by the application require both values.
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, email)
);

CREATE INDEX customers_organization_name_idx
  ON customers(organization_id, name);

CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  base_price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL CHECK (length(currency) = 3),
  default_retention_days INTEGER NOT NULL
);

INSERT INTO packages
  (id, code, name, active, base_price_cents, currency, default_retention_days)
VALUES
  ('pkg_basic', 'basic', 'Basic', 1, 1900, 'EUR', 90),
  ('pkg_advanced', 'advanced', 'Advanced', 1, 3900, 'EUR', 90),
  ('pkg_premium', 'premium', 'Premium', 1, 9900, 'EUR', 90);

ALTER TABLE events ADD COLUMN customer_id TEXT REFERENCES customers(id) ON DELETE RESTRICT;
ALTER TABLE events ADD COLUMN package_id TEXT REFERENCES packages(id) ON DELETE RESTRICT;

CREATE INDEX events_organization_customer_idx
  ON events(organization_id, customer_id, starts_at);
CREATE INDEX events_organization_package_idx
  ON events(organization_id, package_id, starts_at);
