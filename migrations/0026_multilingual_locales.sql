-- Widens the locale CHECK constraints from ('sl','en') to the seven marketing
-- languages without rebuilding either parent table. Dropping and recreating
-- events or checkout_orders would activate ON DELETE CASCADE in D1 even when
-- defer_foreign_keys is enabled, deleting dependent production data.
--
-- Keeping the old columns under explicit legacy names is additive and backward
-- compatible at the storage layer. The application continues to read and write
-- `locale`; existing values are copied 1:1.

-- events ---------------------------------------------------------------------

ALTER TABLE events RENAME COLUMN locale TO locale_legacy_0026;

ALTER TABLE events ADD COLUMN locale TEXT NOT NULL DEFAULT 'sl'
  CHECK (locale IN ('sl', 'en', 'de', 'nl', 'es', 'it', 'fr'));

UPDATE events SET locale = locale_legacy_0026;

-- checkout_orders ------------------------------------------------------------

-- Migration 0024 created this index on the old locale column. Recreate it on
-- the widened application-facing column after copying the data.
DROP INDEX checkout_orders_locale_status_idx;

ALTER TABLE checkout_orders RENAME COLUMN locale TO locale_legacy_0026;

ALTER TABLE checkout_orders ADD COLUMN locale TEXT NOT NULL DEFAULT 'sl'
  CHECK (locale IN ('sl', 'en', 'de', 'nl', 'es', 'it', 'fr'));

UPDATE checkout_orders SET locale = locale_legacy_0026;

CREATE INDEX checkout_orders_locale_status_idx
  ON checkout_orders(locale, status, updated_at);
