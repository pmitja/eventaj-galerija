PRAGMA foreign_keys = ON;

-- Additive and backward compatible. Existing automatic categories stay in
-- effect because a NULL override means "use the analysis result".
ALTER TABLE media_files ADD COLUMN quality_override TEXT
  CHECK (quality_override IS NULL OR quality_override IN ('best', 'good', 'duplicate', 'blurry', 'low_quality'));
ALTER TABLE media_files ADD COLUMN quality_override_by TEXT;
ALTER TABLE media_files ADD COLUMN quality_override_at TEXT;

CREATE INDEX media_files_event_effective_quality_idx
  ON media_files(event_id, quality_override, quality_category, technical_score);
