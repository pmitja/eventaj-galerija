PRAGMA foreign_keys = ON;

-- Additive and backward-compatible. Persists the guest's own selfie face as a
-- provider-opaque face id so "Osveži" (refresh) can re-run the search against
-- newly added event photos without asking for a fresh selfie. Only the opaque
-- provider face id is stored here (never the selfie image, embedding or
-- similarity), it lives in the same event collection as indexed event photos and
-- is deleted by the worker on expiry, "Pozabi" or consent withdrawal.
CREATE TABLE face_guest_probes (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
  consent_record_id TEXT NOT NULL REFERENCES consent_records(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_face_id TEXT NOT NULL,
  model_version TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (event_id, guest_id, provider),
  UNIQUE (provider, provider_face_id)
);

CREATE INDEX face_guest_probes_expires_idx ON face_guest_probes(expires_at);
CREATE INDEX face_guest_probes_event_guest_idx
  ON face_guest_probes(event_id, guest_id, provider);
