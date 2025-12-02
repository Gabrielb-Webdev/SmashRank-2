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

    // Ejecutar las migraciones SQL directamente
    try {
      // 1. Agregar columnas al modelo Match
      await prisma.$executeRaw`
        ALTER TABLE "Match" 
        ADD COLUMN IF NOT EXISTS "roundName" TEXT,
        ADD COLUMN IF NOT EXISTS "position" INTEGER,
        ADD COLUMN IF NOT EXISTS "player1Source" TEXT,
        ADD COLUMN IF NOT EXISTS "player2Source" TEXT,
        ADD COLUMN IF NOT EXISTS "loserId" TEXT,
        ADD COLUMN IF NOT EXISTS "scheduledTime" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "previousMatch1Id" TEXT,
        ADD COLUMN IF NOT EXISTS "previousMatch2Id" TEXT,
        ADD COLUMN IF NOT EXISTS "streamUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "isLive" BOOLEAN DEFAULT false;
      `;
      details.push('✓ Columnas agregadas al modelo Match');

      // 2. Actualizar valores por defecto para columnas existentes
      await prisma.$executeRaw`
        UPDATE "Match" 
        SET "roundName" = 'Round 1',
            "position" = 0,
            "isLive" = false
        WHERE "roundName" IS NULL;
      `;
      details.push('✓ Valores por defecto aplicados en Match');

      // 3. Hacer roundName y position NOT NULL
      await prisma.$executeRaw`
        ALTER TABLE "Match"
        ALTER COLUMN "roundName" SET NOT NULL,
        ALTER COLUMN "position" SET NOT NULL;
      `;
      details.push('✓ Columnas obligatorias configuradas en Match');

      // 4. Agregar índices a Match
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Match_bracketType_idx" ON "Match"("bracketType");
      `;
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Match_roundNumber_idx" ON "Match"("roundNumber");
      `;
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Match_isLive_idx" ON "Match"("isLive");
      `;
      details.push('✓ Índices creados en Match');

      // 5. Agregar columnas al modelo Registration
      await prisma.$executeRaw`
        ALTER TABLE "Registration"
        ADD COLUMN IF NOT EXISTS "seedBadge" TEXT,
        ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE',
        ADD COLUMN IF NOT EXISTS "currentBracket" TEXT DEFAULT 'WINNERS',
        ADD COLUMN IF NOT EXISTS "finalPlacement" INTEGER;
      `;
      details.push('✓ Columnas agregadas al modelo Registration');

      // 6. Actualizar valores por defecto en Registration
      await prisma.$executeRaw`
        UPDATE "Registration"
        SET "status" = 'ACTIVE',
            "currentBracket" = 'WINNERS'
        WHERE "status" IS NULL;
      `;
      details.push('✓ Valores por defecto aplicados en Registration');

      // 7. Hacer status y currentBracket NOT NULL
      await prisma.$executeRaw`
        ALTER TABLE "Registration"
        ALTER COLUMN "status" SET NOT NULL,
        ALTER COLUMN "currentBracket" SET NOT NULL;
      `;
      details.push('✓ Columnas obligatorias configuradas en Registration');

      // 8. Agregar índices a Registration
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Registration_seed_idx" ON "Registration"("seed");
      `;
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Registration_status_idx" ON "Registration"("status");
      `;
      details.push('✓ Índices creados en Registration');

      // 9. Agregar columnas al modelo Tournament
      await prisma.$executeRaw`
        ALTER TABLE "Tournament"
        ADD COLUMN IF NOT EXISTS "prizePool" TEXT,
        ADD COLUMN IF NOT EXISTS "streamUrls" TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "showProjected" BOOLEAN DEFAULT true;
      `;
      details.push('✓ Columnas agregadas al modelo Tournament');

      // 10. Actualizar valores por defecto en Tournament
      await prisma.$executeRaw`
        UPDATE "Tournament"
        SET "streamUrls" = '{}',
            "showProjected" = true
        WHERE "streamUrls" IS NULL;
      `;
      details.push('✓ Valores por defecto aplicados en Tournament');

      // 11. Hacer streamUrls y showProjected NOT NULL
      await prisma.$executeRaw`
        ALTER TABLE "Tournament"
        ALTER COLUMN "streamUrls" SET NOT NULL,
        ALTER COLUMN "showProjected" SET NOT NULL;
      `;
      details.push('✓ Columnas obligatorias configuradas en Tournament');

      return NextResponse.json({
        success: true,
        message: 'Migración aplicada exitosamente',
        details,
      });

    } catch (dbError: any) {
      console.error('Database migration error:', dbError);
      
      // Si el error es porque las columnas ya existen, está OK
      if (dbError.message?.includes('already exists')) {
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
          details: [dbError.message],
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in migration:', error);
    return NextResponse.json(
      { 
        error: 'Error en el servidor',
        details: [error.message],
      },
      { status: 500 }
    );
  }
}
