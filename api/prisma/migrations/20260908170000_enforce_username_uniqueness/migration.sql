-- Keep the migration history aligned with the current User model.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key"
ON "User"("username");

-- Usernames are compared after trim/lowercase normalization by the API.
-- Enforce the same uniqueness rule for every database writer.
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_normalized_key"
ON "User"(LOWER(BTRIM("username")))
WHERE "username" IS NOT NULL;
