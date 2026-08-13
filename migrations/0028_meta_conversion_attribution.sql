-- Additive and backwards-compatible: older application versions ignore these
-- columns, while existing orders default to no marketing consent.
ALTER TABLE checkout_orders ADD COLUMN marketing_consent INTEGER NOT NULL DEFAULT 0
  CHECK (marketing_consent IN (0, 1));
ALTER TABLE checkout_orders ADD COLUMN marketing_consent_version TEXT;
ALTER TABLE checkout_orders ADD COLUMN meta_fbp TEXT;
ALTER TABLE checkout_orders ADD COLUMN meta_fbc TEXT;
ALTER TABLE checkout_orders ADD COLUMN meta_client_ip TEXT;
ALTER TABLE checkout_orders ADD COLUMN meta_client_user_agent TEXT;
ALTER TABLE checkout_orders ADD COLUMN meta_purchase_sent_at TEXT;
