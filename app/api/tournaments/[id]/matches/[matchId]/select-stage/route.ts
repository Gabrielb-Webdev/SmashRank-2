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

    if (game.status !== 'STAGE_SELECT') {
      return NextResponse.json(
        { error: 'Este game no está en fase de selección de stage' },
        { status: 400 }
      );
    }

    // Verificar que el stage no esté baneado
    if (game.bannedStages.includes(stageId)) {
      return NextResponse.json(
        { error: 'Este stage está baneado' },
        { status: 400 }
      );
    }

    // Verificar quién debe seleccionar
    let canSelect = false;

    if (gameNumber === 1) {
      // Game 1: Player 1 selecciona (quien está arriba)
      canSelect = isPlayer1;
    } else {
      // Games 2+: El perdedor del game anterior selecciona
      const previousGame = await prisma.matchGame.findFirst({
        where: {
          matchId: params.matchId,
          gameNumber: gameNumber - 1,
        },
      });

      if (previousGame?.winnerId) {
        const loserId =
          previousGame.winnerId === match.player1Id
            ? match.player2Id
            : match.player1Id;
        canSelect = session.user.id === loserId;
      }
    }

    if (!canSelect) {
      return NextResponse.json(
        { error: 'No es tu turno para seleccionar el stage' },
        { status: 400 }
      );
    }

    const updatedGame = await prisma.matchGame.update({
      where: { id: game.id },
      data: {
        selectedStage: stageId,
        status: 'CHAR_SELECT',
      },
    });

    return NextResponse.json({
      success: true,
      game: updatedGame,
    });
  } catch (error) {
    console.error('Error al seleccionar stage:', error);
    return NextResponse.json(
      { error: 'Error al seleccionar stage' },
      { status: 500 }
    );
  }
}
