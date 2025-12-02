import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden iniciar torneos.' },
        { status: 403 }
      );
    }

    // Verificar que el torneo existe y tiene matches
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que tenga matches generados
    const matchCount = await prisma.match.count({
      where: { tournamentId: params.id },
    });

    if (matchCount === 0) {
      return NextResponse.json(
        { error: 'Debe generar el bracket antes de iniciar el torneo' },
        { status: 400 }
      );
    }

    if (tournament.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'El torneo ya está en progreso' },
        { status: 400 }
      );
    }

    // Actualizar estado del torneo
    await prisma.tournament.update({
      where: { id: params.id },
      data: { status: 'IN_PROGRESS' },
    });

    return NextResponse.json({
      success: true,
      message: 'Torneo iniciado exitosamente',
    });
  } catch (error) {
    console.error('Error al iniciar torneo:', error);
    return NextResponse.json(
      { error: 'Error al iniciar el torneo' },
      { status: 500 }
    );
  }
}
