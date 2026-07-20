PRAGMA foreign_keys = ON;

-- Additive migration. Existing accounts and checkout orders remain valid; new
-- public purchases use this table for idempotent QR and archive delivery.
CREATE TABLE event_deliveries (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  checkout_order_id TEXT NOT NULL UNIQUE REFERENCES checkout_orders(id) ON DELETE CASCADE,
  access_point_id TEXT NOT NULL REFERENCES access_points(id) ON DELETE RESTRICT,
  recipient_email TEXT NOT NULL,
  qr_email_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (qr_email_status IN ('pending', 'sent', 'failed')),
  qr_email_sent_at TEXT,
  export_id TEXT UNIQUE REFERENCES download_exports(id) ON DELETE SET NULL,
  download_token_hash TEXT UNIQUE,
  download_expires_at TEXT,
  archive_email_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (archive_email_status IN ('pending', 'sent', 'failed')),
  archive_email_sent_at TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX event_deliveries_qr_status_idx
  ON event_deliveries(qr_email_status, updated_at);
CREATE INDEX event_deliveries_archive_status_idx
  ON event_deliveries(archive_email_status, updated_at);
CREATE INDEX event_deliveries_download_expiry_idx
  ON event_deliveries(download_expires_at)
  WHERE download_expires_at IS NOT NULL;
