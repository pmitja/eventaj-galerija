PRAGMA foreign_keys = ON;

-- Additive: older deployments ignore these fields. Tokens are random secrets;
-- the hash is authoritative for lookup, while the plaintext copy exists only
-- so the transactional email worker can retry delivery idempotently.
ALTER TABLE event_deliveries ADD COLUMN management_token TEXT;
ALTER TABLE event_deliveries ADD COLUMN management_token_hash TEXT;
ALTER TABLE event_deliveries ADD COLUMN setup_email_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (setup_email_status IN ('pending', 'sent', 'failed'));
ALTER TABLE event_deliveries ADD COLUMN setup_email_sent_at TEXT;
ALTER TABLE event_deliveries ADD COLUMN setup_completed_at TEXT;

CREATE UNIQUE INDEX event_deliveries_management_token_hash_idx
  ON event_deliveries(management_token_hash)
  WHERE management_token_hash IS NOT NULL;

