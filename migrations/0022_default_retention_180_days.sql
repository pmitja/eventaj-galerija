-- Backward compatible: updates the default for events created after this
-- migration. Existing events keep their captured retention_until value so a
-- previously communicated personal-data deletion date is not extended.
UPDATE packages
SET default_retention_days = 180
WHERE active = 1;
