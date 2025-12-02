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

    const { stageId } = await request.json();

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID requerido' },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
      include: {
        player1: true,
        player2: true,
        games: {
          orderBy: { gameNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match no encontrado' }, { status: 404 });
    }

    if (match.tournamentId !== params.id) {
      return NextResponse.json(
        { error: 'Match no pertenece a este torneo' },
        { status: 400 }
      );
    }

    const isPlayer1 = match.player1Id === session.user.id;
    const isPlayer2 = match.player2Id === session.user.id;

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json(
        { error: 'No eres participante de este match' },
        { status: 403 }
      );
    }

    const currentGame = match.games[0];
    if (!currentGame) {
      return NextResponse.json({ error: 'Game no encontrado' }, { status: 404 });
    }

    // Verificar que estamos en fase de STAGE_SELECT
    if (currentGame.phase !== 'STAGE_SELECT') {
      return NextResponse.json(
        { error: `No es el momento de seleccionar stage. Fase actual: ${currentGame.phase}` },
        { status: 400 }
      );
    }

    const playerTurn = isPlayer1 ? 'PLAYER1' : 'PLAYER2';

    // Verificar que es el turno del jugador
    if (currentGame.currentTurn !== playerTurn) {
      const waitingFor = currentGame.currentTurn === 'PLAYER1' ? match.player1?.username : match.player2?.username;
      return NextResponse.json(
        { error: `No es tu turno. Esperando a ${waitingFor}` },
        { status: 400 }
      );
    }

    // Verificar que el stage no esté baneado
    if (currentGame.bannedStages.includes(stageId)) {
      return NextResponse.json(
        { error: 'Este stage está baneado' },
        { status: 400 }
      );
    }

    // DSR (Dave's Stupid Rule): No puedes elegir un stage donde ya ganaste
    if (currentGame.gameNumber > 1) {
      if (isPlayer1 && match.player1WonStages.includes(stageId)) {
        return NextResponse.json(
          { error: 'DSR: No puedes elegir un stage donde ya ganaste' },
          { status: 400 }
        );
      }
      if (isPlayer2 && match.player2WonStages.includes(stageId)) {
        return NextResponse.json(
          { error: 'DSR: No puedes elegir un stage donde ya ganaste' },
          { status: 400 }
        );
      }
    }

    // Actualizar el game con el stage seleccionado
    const updatedGame = await prisma.matchGame.update({
      where: { id: currentGame.id },
      data: {
        selectedStage: stageId,
        phase: 'PLAYING',
        currentTurn: null, // Ya no hay turnos durante el juego
      },
    });

    return NextResponse.json({
      success: true,
      game: updatedGame,
      message: 'Stage seleccionado. ¡Jueguen el game!',
    });
  } catch (error) {
    console.error('Error al seleccionar stage:', error);
    return NextResponse.json(
      { error: 'Error al seleccionar stage' },
      { status: 500 }
    );
  }
}
