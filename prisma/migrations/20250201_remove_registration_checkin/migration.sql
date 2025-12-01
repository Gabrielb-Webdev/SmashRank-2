-- Remove checkedIn and checkedInAt columns from Registration table
ALTER TABLE "Registration" DROP COLUMN IF EXISTS "checkedIn";
ALTER TABLE "Registration" DROP COLUMN IF EXISTS "checkedInAt";
