PRAGMA foreign_keys = ON;

CREATE TABLE event_guests (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  display_name TEXT,
  normalized_display_name TEXT,
  show_on_live_screen INTEGER NOT NULL DEFAULT 1 CHECK (show_on_live_screen IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (display_name IS NULL AND normalized_display_name IS NULL) OR
    (display_name IS NOT NULL AND normalized_display_name IS NOT NULL)
  ),
  UNIQUE (event_id, id)
);

CREATE UNIQUE INDEX event_guests_event_display_name_idx
  ON event_guests(event_id, normalized_display_name)
  WHERE normalized_display_name IS NOT NULL;
CREATE INDEX event_guests_event_updated_idx ON event_guests(event_id, updated_at);

-- Nullable for sessions created by clients deployed before anonymous identity.
ALTER TABLE upload_sessions ADD COLUMN guest_id TEXT REFERENCES event_guests(id) ON DELETE SET NULL;
CREATE INDEX upload_sessions_event_guest_idx ON upload_sessions(event_id, guest_id, created_at);

-- Marks when a photo first passed the effective publication gate. Existing
-- accepted media keeps its historical upload time and does not create events.
ALTER TABLE media_files ADD COLUMN quality_accepted_at TEXT;
UPDATE media_files
SET quality_accepted_at = uploaded_at
WHERE status = 'ready'
  AND COALESCE(quality_override, quality_category) IN ('best', 'good');
CREATE INDEX media_files_event_quality_accepted_idx
  ON media_files(event_id, quality_accepted_at)
  WHERE quality_accepted_at IS NOT NULL;

CREATE TABLE engagement_events (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES event_guests(id) ON DELETE SET NULL,
  upload_session_id TEXT REFERENCES upload_sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'upload_accepted',
    'guest_milestone',
    'leader_changed',
    'photo_total_milestone',
    'contributor_total_milestone'
  )),
  count INTEGER NOT NULL CHECK (count > 0),
  dedupe_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (event_id, dedupe_key)
);

CREATE INDEX engagement_events_event_created_idx
  ON engagement_events(event_id, created_at DESC);

CREATE TABLE event_engagement_state (
  event_id TEXT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  leader_guest_id TEXT REFERENCES event_guests(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL
);

