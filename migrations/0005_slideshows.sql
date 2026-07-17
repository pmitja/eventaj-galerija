PRAGMA foreign_keys = ON;

-- Backward compatibility: additive column with an approved default keeps all
-- existing ready photos visible in the new slideshow unless an admin hides one.
ALTER TABLE media_files ADD COLUMN slideshow_state TEXT NOT NULL DEFAULT 'approved'
  CHECK (slideshow_state IN ('approved', 'hidden'));

CREATE INDEX media_files_event_slideshow_idx
  ON media_files(event_id, slideshow_state, uploaded_at);

CREATE TABLE slideshows (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TEXT NOT NULL,
  rotated_at TEXT NOT NULL
);

CREATE INDEX slideshows_status_event_idx ON slideshows(status, event_id);
