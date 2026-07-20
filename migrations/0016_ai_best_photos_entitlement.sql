PRAGMA foreign_keys = ON;

-- Additive and backward-compatible. New Stripe events already receive a
-- checkout snapshot; this fills older events according to their legacy plan.
INSERT INTO event_entitlements
  (id, event_id, feature_code, value_json, source, source_id, created_at, updated_at)
SELECT lower(hex(randomblob(16))), e.id, 'ai_best_photos',
       CASE WHEN p.code IN ('advanced', 'premium') THEN '{"enabled":true,"photoLimit":3000}' ELSE 'false' END,
       'package', e.package_id, e.created_at, e.updated_at
FROM events e
LEFT JOIN packages p ON p.id = e.package_id
WHERE NOT EXISTS (
  SELECT 1 FROM event_entitlements ee
  WHERE ee.event_id = e.id AND ee.feature_code = 'ai_best_photos'
);
