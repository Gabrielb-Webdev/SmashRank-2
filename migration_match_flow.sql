-- ====================================================================
-- MIGRACIÓN: Sistema de Match Flow Completo
-- Ejecuta este SQL en tu dashboard de Neon (neon.tech)
-- ====================================================================

-- 1. Agregar campos a MatchGame para tracking de fases y turnos
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "phase" TEXT DEFAULT 'LOBBY';
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "currentTurn" TEXT;
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "previousWinnerId" TEXT;

-- 2. Agregar campos para tracking de bans por jugador
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "bannedByPlayer1" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "bannedByPlayer2" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "banTurnCount" INTEGER DEFAULT 0;

-- 3. Agregar campos para lobby status
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "player1JoinedLobby" BOOLEAN DEFAULT false;
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "player2JoinedLobby" BOOLEAN DEFAULT false;

-- 4. Agregar campo completedAt
ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- 5. Agregar campos a Match para DSR (Dave's Stupid Rule)
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "player1WonStages" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "player2WonStages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 6. Agregar campos a Tournament para stages
ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "starterStages" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "counterpickStages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 7. Crear índices para mejor performance
DO $$ 
BEGIN
    -- Índice único para MatchGame (matchId + gameNumber)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'MatchGame_matchId_gameNumber_key'
    ) THEN
        CREATE UNIQUE INDEX "MatchGame_matchId_gameNumber_key" ON "MatchGame"("matchId", "gameNumber");
    END IF;

    -- Índice para phase
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'MatchGame_phase_idx'
    ) THEN
        CREATE INDEX "MatchGame_phase_idx" ON "MatchGame"("phase");
    END IF;
END $$;

-- 8. Verificar que las columnas se crearon correctamente
SELECT 
    'MatchGame' as table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'MatchGame'
  AND column_name IN ('phase', 'currentTurn', 'previousWinnerId', 'bannedByPlayer1', 'bannedByPlayer2', 'banTurnCount', 'player1JoinedLobby', 'player2JoinedLobby', 'completedAt')
ORDER BY column_name;

SELECT 
    'Match' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'Match'
  AND column_name IN ('player1WonStages', 'player2WonStages')
ORDER BY column_name;

SELECT 
    'Tournament' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'Tournament'
  AND column_name IN ('starterStages', 'counterpickStages')
ORDER BY column_name;

-- ====================================================================
-- Resultado esperado:
-- Deberías ver 9 columnas de MatchGame, 2 de Match, y 2 de Tournament
-- ====================================================================
