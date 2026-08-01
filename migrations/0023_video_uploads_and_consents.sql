PRAGMA foreign_keys = ON;

-- Additive migration. Older application versions ignore the new columns and
-- image rows retain their previous behavior through defaults.
ALTER TABLE checkout_orders ADD COLUMN video_unlimited INTEGER NOT NULL DEFAULT 0
  CHECK (video_unlimited IN (0, 1));
ALTER TABLE checkout_orders ADD COLUMN legal_terms_version TEXT;

ALTER TABLE media_files ADD COLUMN kind TEXT NOT NULL DEFAULT 'image'
  CHECK (kind IN ('image', 'video'));
ALTER TABLE media_files ADD COLUMN stream_uid TEXT;
ALTER TABLE media_files ADD COLUMN duration_ms INTEGER
  CHECK (duration_ms IS NULL OR duration_ms > 0);
ALTER TABLE media_files ADD COLUMN poster_key TEXT;
ALTER TABLE media_files ADD COLUMN processing_error_code TEXT;

CREATE UNIQUE INDEX media_files_stream_uid_unique_idx
  ON media_files(stream_uid) WHERE stream_uid IS NOT NULL;
CREATE INDEX media_files_event_kind_status_idx
  ON media_files(event_id, kind, status, created_at);

-- Upload consents use the consent_records table introduced in 0014. The
-- media/session references are kept in evidence_json so older face-search
-- code and the established purpose-based audit model remain compatible.
CREATE INDEX consent_records_event_purpose_idx
  ON consent_records(event_id, purpose, created_at);

-- Existing retained events receive the same base video entitlement as new
-- purchases. No Stream asset is created until a guest explicitly uploads one.
INSERT INTO event_entitlements
  (id, event_id, feature_code, value_json, source, source_id, created_at, updated_at)
SELECT
  lower(hex(randomblob(16))), e.id, 'video_uploads',
  '{"includedCount":20,"unlimited":false,"maxDurationSeconds":60,"maxBytes":524288000,"fairUseCount":1000}',
  'migration', '0023_video_uploads_and_consents',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM events e
WHERE e.retention_until > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  AND NOT EXISTS (
    SELECT 1 FROM event_entitlements ee
    WHERE ee.event_id = e.id AND ee.feature_code = 'video_uploads'
  );
