import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { gameNumber, stageId } = body;

    if (!gameNumber || !stageId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
      include: {
        games: {
          where: { gameNumber },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario es participante
    const isPlayer1 = match.player1Id === session.user.id;
    const isPlayer2 = match.player2Id === session.user.id;

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json(
        { error: 'No eres participante de este match' },
        { status: 403 }
      );
    }

    const game = match.games[0];
    if (!game) {
      return NextResponse.json({ error: 'Game no encontrado' }, { status: 404 });
    }

    if (game.status !== 'BANNING') {
      return NextResponse.json(
        { error: 'Este game no está en fase de baneo' },
        { status: 400 }
      );
    }

    // Verificar que el stage no esté ya baneado
    if (game.bannedStages.includes(stageId)) {
      return NextResponse.json(
        { error: 'Este stage ya fue baneado' },
        { status: 400 }
      );
    }

    // Lógica de baneo según game y ganador anterior
    const bannedStages = [...game.bannedStages, stageId];
    let newStatus = game.status;
    let canBan = false;

    if (gameNumber === 1) {
      // Game 1: Player 1 banea 1, Player 2 banea 2
      if (isPlayer1 && bannedStages.length === 1) {
        canBan = true;
      } else if (isPlayer2 && bannedStages.length > 1 && bannedStages.length <= 3) {
        canBan = true;
        if (bannedStages.length === 3) {
          newStatus = 'STAGE_SELECT';
        }
      }
    } else {
      // Games 2+: El ganador del game anterior banea 3
      const previousGame = await prisma.matchGame.findFirst({
        where: {
          matchId: params.matchId,
          gameNumber: gameNumber - 1,
        },
      });

      if (previousGame?.winnerId === session.user.id) {
        canBan = true;
        if (bannedStages.length === 3) {
          newStatus = 'STAGE_SELECT';
        }
      }
    }

    if (!canBan) {
      return NextResponse.json(
        { error: 'No es tu turno para banear o ya baneaste tus stages' },
        { status: 400 }
      );
    }

    const updatedGame = await prisma.matchGame.update({
      where: { id: game.id },
      data: {
        bannedStages,
        status: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      game: updatedGame,
    });
  } catch (error) {
    console.error('Error al banear stage:', error);
    return NextResponse.json(
      { error: 'Error al procesar el baneo' },
      { status: 500 }
    );
  }
}
