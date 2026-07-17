PRAGMA foreign_keys = ON;

-- Backfill jobs are additive. They keep mass re-analysis outside the web
-- request and make at-least-once Queue delivery observable and idempotent.
CREATE TABLE quality_backfills (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('missing', 'failed', 'all')),
  model_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  error_code TEXT,
  fanout_completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE UNIQUE INDEX quality_backfills_one_active_event_idx
  ON quality_backfills(event_id) WHERE status IN ('queued', 'processing');
CREATE INDEX quality_backfills_event_created_idx
  ON quality_backfills(event_id, created_at DESC);

CREATE TABLE quality_backfill_items (
  backfill_id TEXT NOT NULL REFERENCES quality_backfills(id) ON DELETE CASCADE,
  media_file_id TEXT NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'completed', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  error_code TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (backfill_id, media_file_id)
);

CREATE INDEX quality_backfill_items_status_idx
  ON quality_backfill_items(backfill_id, status);
