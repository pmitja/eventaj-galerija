PRAGMA foreign_keys = ON;

-- Persist the live projection (slideshow) token on the delivery so both the QR
-- email and the checkout success screen can show the same stable link. The
-- slideshows table keeps only the hash; checkout customers never sign in to
-- rotate it, so the raw capability token lives here for re-display.
ALTER TABLE event_deliveries ADD COLUMN slideshow_token TEXT;
