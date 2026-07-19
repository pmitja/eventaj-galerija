PRAGMA foreign_keys = ON;

-- Additive and backward-compatible. Older application versions ignore these
-- tables. Premium events receive the documented entitlement snapshot; all
-- other events remain fail-closed.
CREATE TABLE event_entitlements (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  feature_code TEXT NOT NULL,
  value_json TEXT NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (event_id, feature_code)
);

CREATE INDEX event_entitlements_feature_event_idx
  ON event_entitlements(feature_code, event_id);

INSERT INTO event_entitlements
  (id, event_id, feature_code, value_json, source, source_id, created_at, updated_at)
SELECT lower(hex(randomblob(16))), e.id, 'face_collections',
       CASE WHEN p.code = 'premium' THEN 'true' ELSE 'false' END,
       'package', e.package_id, e.created_at, e.updated_at
FROM events e
LEFT JOIN packages p ON p.id = e.package_id;

CREATE TABLE consent_records (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  subject_reference TEXT NOT NULL,
  purpose TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  granted INTEGER NOT NULL CHECK (granted IN (0, 1)),
  granted_at TEXT,
  withdrawn_at TEXT,
  evidence_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX consent_records_event_subject_idx
  ON consent_records(event_id, subject_reference, purpose, created_at);

CREATE TABLE face_index_jobs (
  id TEXT PRIMARY KEY,
  media_file_id TEXT NOT NULL UNIQUE REFERENCES media_files(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  error_code TEXT,
  last_enqueued_at TEXT,
  processing_started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX face_index_jobs_status_updated_idx
  ON face_index_jobs(status, updated_at);

CREATE TABLE face_provider_faces (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  media_file_id TEXT NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_face_id TEXT NOT NULL,
  model_version TEXT,
  confidence REAL NOT NULL,
  bounding_box_json TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (provider, provider_face_id),
  UNIQUE (media_file_id, provider_face_id)
);

CREATE INDEX face_provider_faces_event_provider_idx
  ON face_provider_faces(event_id, provider, provider_face_id);

CREATE TABLE face_search_sessions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  guest_id TEXT NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
  consent_record_id TEXT NOT NULL REFERENCES consent_records(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  selfie_object_key TEXT UNIQUE,
  declared_mime TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('awaiting_upload', 'queued', 'searching', 'completed', 'failed', 'withdrawn', 'expired')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  error_code TEXT,
  expires_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX face_search_sessions_event_guest_created_idx
  ON face_search_sessions(event_id, guest_id, created_at);
CREATE INDEX face_search_sessions_status_expires_idx
  ON face_search_sessions(status, expires_at);

CREATE TABLE face_search_matches (
  session_id TEXT NOT NULL REFERENCES face_search_sessions(id) ON DELETE CASCADE,
  media_file_id TEXT NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  similarity REAL NOT NULL,
  provider TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (session_id, media_file_id)
);

CREATE INDEX face_search_matches_session_similarity_idx
  ON face_search_matches(session_id, similarity DESC);

-- A withdrawn/expired session can race an in-flight provider response. Ignore
-- late inserts unless the session is still actively searching, and physically
-- clear matches whenever consent or the session becomes terminal without a
-- successful result.
CREATE TRIGGER face_search_matches_active_session_only
BEFORE INSERT ON face_search_matches
WHEN NOT EXISTS (
  SELECT 1 FROM face_search_sessions s
  WHERE s.id = NEW.session_id AND s.status = 'searching'
)
BEGIN
  SELECT RAISE(IGNORE);
END;

CREATE TRIGGER face_search_terminal_cleanup
AFTER UPDATE OF status ON face_search_sessions
WHEN NEW.status IN ('failed', 'withdrawn', 'expired')
BEGIN
  DELETE FROM face_search_matches WHERE session_id = NEW.id;
END;

INSERT INTO face_index_jobs
  (id, media_file_id, organization_id, status, attempt_count, created_at, updated_at)
SELECT lower(hex(randomblob(16))), m.id, e.organization_id, 'queued', 0,
       strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM media_files m
JOIN events e ON e.id = m.event_id
JOIN event_entitlements ee ON ee.event_id = e.id
WHERE m.status = 'ready' AND ee.feature_code = 'face_collections'
  AND ee.value_json = 'true';
