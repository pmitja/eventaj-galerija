-- Adds the optional AI face-search add-on to self-serve checkout orders.
-- Existing orders default to disabled; provisioning reads this flag to set the
-- event's `face_collections` entitlement to 'true' when the add-on was purchased.
ALTER TABLE checkout_orders
  ADD COLUMN face_collections INTEGER NOT NULL DEFAULT 0 CHECK (face_collections IN (0, 1));
