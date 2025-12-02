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

    // Verificar que el usuario es participante
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

    // Verificar que estamos en fase de STAGE_BAN
    if (currentGame.phase !== 'STAGE_BAN') {
      return NextResponse.json(
        { error: `No es el momento de banear stages. Fase actual: ${currentGame.phase}` },
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

    // Verificar que el stage no esté ya baneado
    if (currentGame.bannedStages.includes(stageId)) {
      return NextResponse.json(
        { error: 'Este stage ya fue baneado' },
        { status: 400 }
      );
    }

    const updateData: any = {
      bannedStages: [...currentGame.bannedStages, stageId],
      banTurnCount: currentGame.banTurnCount + 1,
    };

    // Actualizar banned lists por jugador
    if (isPlayer1) {
      updateData.bannedByPlayer1 = [...currentGame.bannedByPlayer1, stageId];
    } else {
      updateData.bannedByPlayer2 = [...currentGame.bannedByPlayer2, stageId];
    }

    // Lógica de turnos según game
    if (currentGame.gameNumber === 1) {
      // Game 1: Patrón 1-2-1
      // Player 1 banea 1, luego Player 2 banea 2, luego Player 1 banea 1 más
      const totalBans = updateData.banTurnCount;
      
      if (totalBans === 1) {
        // Player 1 baneó 1, turno de Player 2
        updateData.currentTurn = 'PLAYER2';
      } else if (totalBans === 2) {
        // Player 2 baneó su primero, sigue Player 2
        updateData.currentTurn = 'PLAYER2';
      } else if (totalBans === 3) {
        // Player 2 baneó su segundo, turno de Player 1 para banear el último
        updateData.currentTurn = 'PLAYER1';
      } else if (totalBans === 4) {
        // Banning completo, Player 1 elige stage
        updateData.phase = 'STAGE_SELECT';
        updateData.currentTurn = 'PLAYER1';
      }
    } else {
      // Games 2-3: Winner banea 3 stages
      const totalBans = updateData.banTurnCount;
      
      if (totalBans >= 3) {
        // Winner terminó de banear, loser elige stage
        const winnerId = currentGame.previousWinnerId;
        const loserTurn = winnerId === match.player1Id ? 'PLAYER2' : 'PLAYER1';
        updateData.phase = 'STAGE_SELECT';
        updateData.currentTurn = loserTurn;
      } else {
        // Winner sigue baneando
        updateData.currentTurn = playerTurn;
      }
    }

    const updatedGame = await prisma.matchGame.update({
      where: { id: currentGame.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      game: updatedGame,
      message: 'Stage baneado exitosamente',
      nextPhase: updateData.phase || 'STAGE_BAN',
    });
  } catch (error) {
    console.error('Error al banear stage:', error);
    return NextResponse.json(
      { error: 'Error al procesar el baneo' },
      { status: 500 }
    );
  }
}
