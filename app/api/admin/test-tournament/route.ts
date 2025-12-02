import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    console.log('🧪 Iniciando creación de torneo de prueba...');
    console.log('Usuario:', session.user.id, session.user.username);

    // Datos hardcodeados que funcionan
    const now = new Date();
    const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días
    const registrationStart = now;
    const registrationEnd = startDate;
    const checkinStart = new Date(startDate.getTime() - 30 * 60 * 1000); // -30 min
    const checkinEnd = startDate;

    const tournamentName = `Torneo de Prueba ${now.getTime()}`;
    const slug = slugify(tournamentName);

    console.log('📋 Datos del torneo:', {
      name: tournamentName,
      slug,
      format: 'DOUBLE_ELIMINATION',
      maxParticipants: 8,
      startDate: startDate.toISOString(),
    });

    const tournament = await prisma.tournament.create({
      data: {
        name: tournamentName,
        slug,
        description: 'Torneo creado automáticamente para pruebas',
        province: 'ONLINE',
        isOnline: true,
        format: 'DOUBLE_ELIMINATION',
        maxParticipants: 8,
        currentParticipants: 0,
        startDate,
        registrationStart,
        registrationEnd,
        checkinStart,
        checkinEnd,
        rules: '3 stocks, 7 minutos, Sin Items',
        stageList: 'Battlefield, Final Destination, Smashville, Town & City, Pokémon Stadium 2',
        ruleset: {
          stocks: 3,
          timeLimit: 7,
          items: 'SIN_ITEMS',
        },
        status: 'REGISTRATION_OPEN',
        createdById: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    console.log('✅ Torneo creado exitosamente:', tournament.id);

    return NextResponse.json({
      success: true,
      tournament,
      message: '✅ Torneo de prueba creado exitosamente',
    });

  } catch (error: any) {
    console.error('❌ Error al crear torneo de prueba:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Error al crear torneo de prueba',
        details: error.message,
        code: error.code,
        meta: error.meta,
      },
      { status: 500 }
    );
  }
}
