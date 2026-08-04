PRAGMA foreign_keys = ON;

-- Additive migration. Older application versions ignore this table and keep
-- serving the existing image/video gallery unchanged.
CREATE TABLE voice_messages (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  upload_session_id TEXT NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES event_guests(id) ON DELETE SET NULL,
  object_key TEXT NOT NULL UNIQUE,
  declared_mime TEXT NOT NULL CHECK (declared_mime IN ('audio/webm', 'audio/mp4', 'audio/ogg')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  duration_ms INTEGER NOT NULL CHECK (duration_ms BETWEEN 1000 AND 120000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'rejected')),
  publication_consent INTEGER NOT NULL DEFAULT 1 CHECK (publication_consent IN (0, 1)),
  uploaded_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX voice_messages_event_public_idx
  ON voice_messages(event_id, status, publication_consent, uploaded_at DESC);
CREATE INDEX voice_messages_session_created_idx
  ON voice_messages(upload_session_id, created_at);
