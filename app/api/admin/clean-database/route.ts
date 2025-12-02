import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    console.log('🗑️ Iniciando limpieza de base de datos...');
    console.log('Usuario admin:', session.user.id, session.user.username);

    // Paso 1: Eliminar todos los matches
    const deletedMatches = await prisma.match.deleteMany();
    console.log(`✅ Eliminados ${deletedMatches.count} matches`);

    // Paso 2: Eliminar todos los registrations
    const deletedRegistrations = await prisma.registration.deleteMany();
    console.log(`✅ Eliminados ${deletedRegistrations.count} registrations`);

    // Paso 3: Eliminar todos los rankings
    const deletedRankings = await prisma.ranking.deleteMany();
    console.log(`✅ Eliminados ${deletedRankings.count} rankings`);

    // Paso 4: Eliminar todos los torneos EXCEPTO los creados por el admin actual
    const deletedTournaments = await prisma.tournament.deleteMany({
      where: {
        createdById: {
          not: session.user.id
        }
      }
    });
    console.log(`✅ Eliminados ${deletedTournaments.count} torneos`);

    // Paso 5: Eliminar todos los usuarios ficticios (con email @test.com) EXCEPTO el admin
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        AND: [
          {
            email: {
              endsWith: '@test.com'
            }
          },
          {
            id: {
              not: session.user.id
            }
          }
        ]
      }
    });
    console.log(`✅ Eliminados ${deletedUsers.count} usuarios ficticios`);

    console.log('✅ Limpieza completada exitosamente!');

    return NextResponse.json({
      success: true,
      message: 'Base de datos limpiada exitosamente',
      deleted: {
        matches: deletedMatches.count,
        registrations: deletedRegistrations.count,
        rankings: deletedRankings.count,
        tournaments: deletedTournaments.count,
        users: deletedUsers.count,
      },
    });

  } catch (error: any) {
    console.error('❌ Error al limpiar base de datos:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    return NextResponse.json(
      {
        error: 'Error al limpiar base de datos',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
