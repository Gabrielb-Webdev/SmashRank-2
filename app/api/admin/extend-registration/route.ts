import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID requerido' },
        { status: 400 }
      );
    }

    const now = new Date();
    const newEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días

    // Extender fecha de inscripción
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        registrationEnd: newEndDate,
        status: 'REGISTRATION_OPEN', // Asegurar que está abierto
      },
    });

    console.log(`✅ Inscripciones extendidas hasta ${newEndDate.toISOString()} para torneo: ${tournament.name}`);

    return NextResponse.json({
      success: true,
      tournament,
      newEndDate,
    });
  } catch (error) {
    console.error('Error al extender inscripciones:', error);
    return NextResponse.json(
      { error: 'Error al extender inscripciones' },
      { status: 500 }
    );
  }
}
