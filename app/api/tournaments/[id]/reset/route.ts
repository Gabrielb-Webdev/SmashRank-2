import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Resetear torneo (volver a DRAFT y eliminar matches)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden resetear torneos.' },
        { status: 403 }
      );
    }

    // Verificar que el torneo existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar todos los matches del torneo
    await prisma.match.deleteMany({
      where: { tournamentId: params.id },
    });

    // Cambiar estado del torneo a DRAFT
    await prisma.tournament.update({
      where: { id: params.id },
      data: { status: 'DRAFT' },
    });

    return NextResponse.json({
      success: true,
      message: 'Torneo reseteado. Ahora puedes regenerar el bracket e iniciarlo nuevamente.',
    });
  } catch (error) {
    console.error('Error al resetear torneo:', error);
    return NextResponse.json(
      { error: 'Error al resetear el torneo' },
      { status: 500 }
    );
  }
}
