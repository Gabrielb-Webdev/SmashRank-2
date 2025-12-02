import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Verificar que sea admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const details: string[] = [];

    // Ejecutar las migraciones SQL directamente según migration_match_flow.sql
    try {
      // 1. Agregar campos a MatchGame para tracking de fases y turnos
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "phase" TEXT DEFAULT 'LOBBY'
      `;
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "currentTurn" TEXT
      `;
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "previousWinnerId" TEXT
      `;
      details.push('✓ Columnas de fase agregadas a MatchGame');

      // 2. Agregar campos para tracking de bans por jugador
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "bannedByPlayer1" TEXT[] DEFAULT ARRAY[]::TEXT[]
      `;
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "bannedByPlayer2" TEXT[] DEFAULT ARRAY[]::TEXT[]
      `;
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "banTurnCount" INTEGER DEFAULT 0
      `;
      details.push('✓ Campos de bans agregados a MatchGame');

      // 3. Agregar campos para lobby status
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "player1JoinedLobby" BOOLEAN DEFAULT false
      `;
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "player2JoinedLobby" BOOLEAN DEFAULT false
      `;
      details.push('✓ Estados de lobby agregados a MatchGame');

      // 4. Agregar campo completedAt
      await prisma.$executeRaw`
        ALTER TABLE "MatchGame" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP
      `;
      details.push('✓ Campo completedAt agregado a MatchGame');

      // 5. Agregar campos a Match para DSR (Dave's Stupid Rule)
      await prisma.$executeRaw`
        ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "player1WonStages" TEXT[] DEFAULT ARRAY[]::TEXT[]
      `;
      await prisma.$executeRaw`
        ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "player2WonStages" TEXT[] DEFAULT ARRAY[]::TEXT[]
      `;
      details.push('✓ Campos DSR agregados a Match');

      // 6. Agregar campos a Tournament para stages
      await prisma.$executeRaw`
        ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "starterStages" TEXT[] DEFAULT ARRAY[]::TEXT[]
      `;
      await prisma.$executeRaw`
        ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "counterpickStages" TEXT[] DEFAULT ARRAY[]::TEXT[]
      `;
      details.push('✓ Configuración de stages agregada a Tournament');

      // 7. Crear índices para mejor performance
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "MatchGame_matchId_gameNumber_key" ON "MatchGame"("matchId", "gameNumber")
      `;
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "MatchGame_phase_idx" ON "MatchGame"("phase")
      `;
      details.push('✓ Índices creados para optimización');

      return NextResponse.json({
        success: true,
        message: 'Migración Match Flow aplicada exitosamente',
        details,
      });

    } catch (dbError: any) {
      console.error('Database migration error:', dbError);
      
      // Si el error es porque las columnas ya existen, está OK
      if (dbError.message?.includes('already exists') || dbError.code === '42701') {
        details.push('⚠ Algunas columnas ya existían (esto es normal)');
        return NextResponse.json({
          success: true,
          message: 'Migración completada (schema ya actualizado)',
          details,
        });
      }

      return NextResponse.json(
        { 
          error: 'Error al aplicar la migración',
          details: [dbError.message || String(dbError)],
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in migration:', error);
    return NextResponse.json(
      { 
        error: 'Error en el servidor',
        details: [error.message || String(error)],
      },
      { status: 500 }
      );
  }
}
