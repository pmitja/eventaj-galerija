-- Backward compatibility: additive migration only. Existing events and upload
-- sessions remain valid; their access-point attribution is NULL until a guest
-- arrives through a newly created stable access point.

CREATE TABLE access_points (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  public_code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'qr' CHECK (type IN ('qr', 'nfc', 'fotobooth', 'direct')),
  label TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  visit_count INTEGER NOT NULL DEFAULT 0 CHECK (visit_count >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX access_points_event_active_idx ON access_points(event_id, active, created_at);

CREATE TABLE visits (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  access_point_id TEXT NOT NULL REFERENCES access_points(id) ON DELETE CASCADE,
  occurred_at TEXT NOT NULL,
  referrer_host TEXT
);

CREATE INDEX visits_access_point_occurred_idx ON visits(access_point_id, occurred_at);
CREATE INDEX visits_event_occurred_idx ON visits(event_id, occurred_at);

ALTER TABLE upload_sessions ADD COLUMN access_point_id TEXT REFERENCES access_points(id) ON DELETE SET NULL;
CREATE INDEX upload_sessions_access_point_idx ON upload_sessions(access_point_id, created_at);
