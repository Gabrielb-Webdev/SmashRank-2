import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        winner: {
          select: {
            id: true,
            username: true,
          },
        },
        games: {
          orderBy: {
            gameNumber: 'asc',
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match no encontrado' },
        { status: 404 }
      );
    }

    if (match.tournamentId !== params.id) {
      return NextResponse.json(
        { error: 'Match no pertenece a este torneo' },
        { status: 400 }
      );
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Error al obtener match:', error);
    return NextResponse.json(
      { error: 'Error al obtener el match' },
      { status: 500 }
    );
  }
}
