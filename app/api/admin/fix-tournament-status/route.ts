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

    // Actualizar status a REGISTRATION_OPEN
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'REGISTRATION_OPEN',
      },
    });

    console.log(`✅ Status actualizado a REGISTRATION_OPEN para torneo: ${tournament.name}`);

    return NextResponse.json({
      success: true,
      tournament,
    });
  } catch (error) {
    console.error('Error al actualizar status:', error);
    return NextResponse.json(
      { error: 'Error al actualizar status del torneo' },
      { status: 500 }
    );
  }
}
