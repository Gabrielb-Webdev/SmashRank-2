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
        { status: 401 }
      );
    }

    const { tournamentId, starterStages, counterpickStages } = await request.json();

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID requerido' },
        { status: 400 }
      );
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        starterStages: starterStages || [],
        counterpickStages: counterpickStages || [],
      },
    });

    return NextResponse.json({
      success: true,
      tournament: updatedTournament,
    });
  } catch (error) {
    console.error('Error al configurar stages:', error);
    return NextResponse.json(
      { error: 'Error al configurar stages' },
      { status: 500 }
    );
  }
}
