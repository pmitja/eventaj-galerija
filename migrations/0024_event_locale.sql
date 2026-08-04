PRAGMA foreign_keys = ON;

-- Additive and backward compatible. Existing Slovenian orders and events keep
-- their current domain, email language and date formatting.
ALTER TABLE checkout_orders
  ADD COLUMN locale TEXT NOT NULL DEFAULT 'sl' CHECK (locale IN ('sl', 'en'));

ALTER TABLE events
  ADD COLUMN locale TEXT NOT NULL DEFAULT 'sl' CHECK (locale IN ('sl', 'en'));

CREATE INDEX checkout_orders_locale_status_idx
  ON checkout_orders(locale, status, updated_at);

