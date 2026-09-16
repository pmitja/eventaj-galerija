-- Add US English; existing rows and their currencies remain unchanged.
-- events ---------------------------------------------------------------------

ALTER TABLE events RENAME COLUMN locale TO locale_legacy_0030;

ALTER TABLE events ADD COLUMN locale TEXT NOT NULL DEFAULT 'sl'
  CHECK (locale IN ('sl', 'en', 'de', 'nl', 'es', 'it', 'fr', 'en-us'));

UPDATE events SET locale = locale_legacy_0030;

-- checkout_orders ------------------------------------------------------------

-- Migration 0024 created this index on the old locale column. Recreate it on
-- the widened application-facing column after copying the data.
DROP INDEX checkout_orders_locale_status_idx;

ALTER TABLE checkout_orders RENAME COLUMN locale TO locale_legacy_0030;

ALTER TABLE checkout_orders ADD COLUMN locale TEXT NOT NULL DEFAULT 'sl'
  CHECK (locale IN ('sl', 'en', 'de', 'nl', 'es', 'it', 'fr', 'en-us'));

UPDATE checkout_orders SET locale = locale_legacy_0030;

CREATE INDEX checkout_orders_locale_status_idx
  ON checkout_orders(locale, status, updated_at);
