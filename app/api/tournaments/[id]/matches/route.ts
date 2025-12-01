import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const matches = await prisma.match.findMany({
      where: { tournamentId: params.id },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        winner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        games: {
          include: {
            winner: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            gameNumber: 'asc',
          },
        },
      },
      orderBy: [
        { bracketType: 'asc' },
        { round: 'asc' },
        { matchNumber: 'asc' },
      ],
    });

    // Verificar DQs automáticos
    const now = new Date();
    const matchesToDQ = matches.filter(
      (match) =>
        match.status === 'CHECKIN' &&
        match.checkInDeadline &&
        now > match.checkInDeadline
    );

    for (const match of matchesToDQ) {
      // DQ al jugador que no hizo check-in
      let winnerId = null;
      if (match.player1CheckIn && !match.player2CheckIn) {
        winnerId = match.player1Id;
      } else if (!match.player1CheckIn && match.player2CheckIn) {
        winnerId = match.player2Id;
      }
      // Si ninguno hizo check-in, ambos pierden (no hay ganador)

      await prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'DQ',
          winnerId,
        },
      });
    }

    // Refrescar matches después de DQ
    const updatedMatches = await prisma.match.findMany({
      where: { tournamentId: params.id },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        winner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        games: {
          include: {
            winner: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            gameNumber: 'asc',
          },
        },
      },
      orderBy: [
        { bracketType: 'asc' },
        { round: 'asc' },
        { matchNumber: 'asc' },
      ],
    });

    return NextResponse.json(updatedMatches);
  } catch (error) {
    console.error('Error al obtener matches:', error);
    return NextResponse.json(
      { error: 'Error al obtener los matches' },
      { status: 500 }
    );
  }
}
