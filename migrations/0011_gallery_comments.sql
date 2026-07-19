PRAGMA foreign_keys = ON;

CREATE TABLE media_comments (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 500),
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX media_comments_media_visible_created_idx
  ON media_comments(media_id, status, created_at);
CREATE INDEX media_comments_event_guest_created_idx
  ON media_comments(event_id, guest_id, created_at DESC);
