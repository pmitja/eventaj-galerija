PRAGMA foreign_keys = ON;

-- Additive and backward compatible. Checkout-created events already keep the
-- original token in event_deliveries, so it can be copied without changing the
-- public URL. Older manually-created slideshows cannot be reversed from their
-- hash; the application assigns those one replacement token on first admin read.
ALTER TABLE slideshows ADD COLUMN access_token TEXT;

UPDATE slideshows
SET access_token = (
  SELECT ed.slideshow_token
  FROM event_deliveries ed
  WHERE ed.event_id = slideshows.event_id
)
WHERE access_token IS NULL
  AND rotated_at = created_at
  AND EXISTS (
    SELECT 1
    FROM event_deliveries ed
    WHERE ed.event_id = slideshows.event_id
      AND ed.slideshow_token IS NOT NULL
  );

CREATE UNIQUE INDEX slideshows_access_token_idx
  ON slideshows(access_token)
  WHERE access_token IS NOT NULL;
