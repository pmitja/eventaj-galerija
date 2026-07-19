PRAGMA foreign_keys = ON;

-- Additive and backward-compatible: existing media rows and statuses remain
-- unchanged. Existing stuck processing rows receive a queued recovery job;
-- the media-processing scheduled handler will enqueue them after deployment.
CREATE TABLE media_processing_jobs (
  id TEXT PRIMARY KEY,
  media_file_id TEXT NOT NULL UNIQUE REFERENCES media_files(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  error_code TEXT,
  last_enqueued_at TEXT,
  processing_started_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX media_processing_jobs_status_updated_idx
  ON media_processing_jobs(status, updated_at);
CREATE INDEX media_processing_jobs_organization_status_idx
  ON media_processing_jobs(organization_id, status, updated_at);

INSERT INTO media_processing_jobs
  (id, media_file_id, organization_id, status, attempt_count, error_code,
   last_enqueued_at, processing_started_at, created_at, updated_at, completed_at)
SELECT lower(
    substr(hex(randomblob(16)), 1, 8) || '-' ||
    substr(hex(randomblob(16)), 1, 4) || '-4' ||
    substr(hex(randomblob(16)), 1, 3) || '-8' ||
    substr(hex(randomblob(16)), 1, 3) || '-' ||
    substr(hex(randomblob(16)), 1, 12)
  ),
  m.id, e.organization_id, 'queued', 0, 'RECOVERED_STUCK_PROCESSING',
  NULL, NULL, m.created_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), NULL
FROM media_files m
JOIN events e ON e.id = m.event_id
WHERE m.status = 'processing';
