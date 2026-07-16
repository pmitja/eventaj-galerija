-- Backward compatibility: additive migration only. The MVP originally had one
-- implicit Eventaj workspace. Existing rows are assigned to that workspace;
-- new admin reads and writes always provide and filter by organization_id.

ALTER TABLE events ADD COLUMN organization_id TEXT NOT NULL DEFAULT 'eventaj';
CREATE INDEX events_organization_status_starts_idx
  ON events(organization_id, status, starts_at);

