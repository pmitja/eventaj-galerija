PRAGMA foreign_keys = ON;

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  public_slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Ljubljana',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  uploads_enabled INTEGER NOT NULL DEFAULT 1 CHECK (uploads_enabled IN (0, 1)),
  gallery_enabled INTEGER NOT NULL DEFAULT 1 CHECK (gallery_enabled IN (0, 1)),
  retention_until TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX events_status_starts_at_idx ON events(status, starts_at);
CREATE INDEX events_retention_until_idx ON events(retention_until);

CREATE TABLE upload_sessions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX upload_sessions_event_id_idx ON upload_sessions(event_id);

CREATE TABLE media_files (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  upload_session_id TEXT NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  gallery_key TEXT UNIQUE,
  thumbnail_key TEXT UNIQUE,
  original_filename TEXT NOT NULL,
  declared_mime TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'rejected')),
  gallery_state TEXT NOT NULL DEFAULT 'visible' CHECK (gallery_state IN ('visible', 'hidden')),
  publication_consent INTEGER NOT NULL DEFAULT 0 CHECK (publication_consent IN (0, 1)),
  uploaded_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX media_files_event_gallery_idx ON media_files(event_id, gallery_state, uploaded_at);
CREATE INDEX media_files_event_status_idx ON media_files(event_id, status, created_at);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  request_id TEXT,
  changes_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX audit_logs_event_created_idx ON audit_logs(event_id, created_at);
