-- AlterTable: Add new columns to Match table for Double Elimination structure
ALTER TABLE "Match" ADD COLUMN "roundName" TEXT;
ALTER TABLE "Match" ADD COLUMN "position" INTEGER;
ALTER TABLE "Match" ADD COLUMN "player1Source" TEXT;
ALTER TABLE "Match" ADD COLUMN "player2Source" TEXT;
ALTER TABLE "Match" ADD COLUMN "loserId" TEXT;
ALTER TABLE "Match" ADD COLUMN "scheduledTime" TIMESTAMP(3);
ALTER TABLE "Match" ADD COLUMN "previousMatch1Id" TEXT;
ALTER TABLE "Match" ADD COLUMN "previousMatch2Id" TEXT;
ALTER TABLE "Match" ADD COLUMN "streamUrl" TEXT;
ALTER TABLE "Match" ADD COLUMN "isLive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Rename 'round' to 'roundNumber' if needed (Prisma might handle this)
-- If 'round' column exists, we'll keep it as 'roundNumber'

-- AlterTable: Add new columns to Registration table for seeding and status
ALTER TABLE "Registration" ADD COLUMN "seedBadge" TEXT;
ALTER TABLE "Registration" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Registration" ADD COLUMN "currentBracket" TEXT NOT NULL DEFAULT 'WINNERS';
ALTER TABLE "Registration" ADD COLUMN "finalPlacement" INTEGER;

-- AlterTable: Add new columns to Tournament table
ALTER TABLE "Tournament" ADD COLUMN "prizePool" TEXT;
ALTER TABLE "Tournament" ADD COLUMN "streamUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Tournament" ADD COLUMN "showProjected" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex: Add indexes for better query performance
CREATE INDEX "Match_bracketType_idx" ON "Match"("bracketType");
CREATE INDEX "Match_roundNumber_idx" ON "Match"("roundNumber");
CREATE INDEX "Match_isLive_idx" ON "Match"("isLive");
CREATE INDEX "Registration_seed_idx" ON "Registration"("seed");
CREATE INDEX "Registration_status_idx" ON "Registration"("status");
