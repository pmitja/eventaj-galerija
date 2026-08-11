PRAGMA foreign_keys = ON;

-- Additive data backfill. Older application versions safely ignore this
-- entitlement; current versions expose the base video allowance when the
-- deployment-wide video feature flag is enabled.
INSERT INTO event_entitlements
  (id, event_id, feature_code, value_json, source, source_id, created_at, updated_at)
SELECT
  lower(hex(randomblob(16))), e.id, 'video_uploads',
  '{"includedCount":20,"unlimited":false,"maxDurationSeconds":60,"maxBytes":524288000,"fairUseCount":1000}',
  'migration', '0027_dashboard_video_entitlements',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM events e
WHERE e.retention_until > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  AND NOT EXISTS (
    SELECT 1 FROM event_entitlements ee
    WHERE ee.event_id = e.id AND ee.feature_code = 'video_uploads'
  );
