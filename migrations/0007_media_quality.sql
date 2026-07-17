PRAGMA foreign_keys = ON;

-- Backward compatibility: all additions are nullable, so existing media stays
-- ready and visible. Analysis is populated only for newly processed images or
-- an explicit future backfill. Duplicate files are retained, never deleted.
ALTER TABLE media_files ADD COLUMN checksum_sha256 TEXT;
ALTER TABLE media_files ADD COLUMN perceptual_hash TEXT;
ALTER TABLE media_files ADD COLUMN width INTEGER CHECK (width IS NULL OR width > 0);
ALTER TABLE media_files ADD COLUMN height INTEGER CHECK (height IS NULL OR height > 0);
ALTER TABLE media_files ADD COLUMN quality_category TEXT
  CHECK (quality_category IS NULL OR quality_category IN ('best', 'good', 'duplicate', 'blurry', 'low_quality'));
ALTER TABLE media_files ADD COLUMN technical_score INTEGER
  CHECK (technical_score IS NULL OR technical_score BETWEEN 0 AND 100);
ALTER TABLE media_files ADD COLUMN duplicate_of_media_id TEXT REFERENCES media_files(id) ON DELETE SET NULL;

CREATE INDEX media_files_event_checksum_idx
  ON media_files(event_id, checksum_sha256) WHERE checksum_sha256 IS NOT NULL;
CREATE INDEX media_files_event_perceptual_hash_idx
  ON media_files(event_id, perceptual_hash) WHERE perceptual_hash IS NOT NULL;
CREATE INDEX media_files_event_quality_idx
  ON media_files(event_id, quality_category, technical_score);

CREATE TABLE ai_analyses (
  id TEXT PRIMARY KEY,
  media_file_id TEXT NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  scores_json TEXT,
  labels_json TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (media_file_id, analysis_type, provider, model_version)
);

CREATE INDEX ai_analyses_media_status_idx
  ON ai_analyses(media_file_id, status, analysis_type);
