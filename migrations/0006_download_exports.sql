PRAGMA foreign_keys = ON;

-- Additive migration. Existing events and media remain unchanged; exports are
-- ephemeral derived artifacts and are deleted independently after expiry.
CREATE TABLE download_exports (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'ready', 'failed', 'expired')),
  object_key TEXT UNIQUE,
  file_name TEXT NOT NULL,
  media_count INTEGER NOT NULL DEFAULT 0 CHECK (media_count >= 0),
  size_bytes INTEGER CHECK (size_bytes IS NULL OR size_bytes >= 0),
  error_code TEXT,
  expires_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX download_exports_event_created_idx
  ON download_exports(event_id, created_at DESC);
CREATE INDEX download_exports_status_updated_idx
  ON download_exports(status, updated_at);
CREATE INDEX download_exports_expiry_idx
  ON download_exports(expires_at) WHERE expires_at IS NOT NULL;
