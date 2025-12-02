-- ====================================================================
-- MIGRACIÓN RÁPIDA: Sistema de Match Flow
-- Copia y pega esto en Neon SQL Editor
-- ====================================================================

-- 1. Agregar campos a MatchGame
ALTER TABLE "MatchGame" 
ADD COLUMN IF NOT EXISTS "phase" TEXT DEFAULT 'LOBBY',
ADD COLUMN IF NOT EXISTS "currentTurn" TEXT,
ADD COLUMN IF NOT EXISTS "previousWinnerId" TEXT,
ADD COLUMN IF NOT EXISTS "bannedByPlayer1" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "bannedByPlayer2" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "banTurnCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "player1JoinedLobby" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "player2JoinedLobby" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- 2. Agregar campos a Match (DSR)
ALTER TABLE "Match" 
ADD COLUMN IF NOT EXISTS "player1WonStages" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "player2WonStages" TEXT[] DEFAULT '{}';

-- 3. Agregar campos a Tournament (stages)
ALTER TABLE "Tournament" 
ADD COLUMN IF NOT EXISTS "starterStages" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "counterpickStages" TEXT[] DEFAULT '{}';

-- 4. Crear índices
CREATE UNIQUE INDEX IF NOT EXISTS "MatchGame_matchId_gameNumber_key" 
ON "MatchGame"("matchId", "gameNumber");

CREATE INDEX IF NOT EXISTS "MatchGame_phase_idx" 
ON "MatchGame"("phase");

-- 5. Verificar
SELECT 'Migration completed!' as status;
