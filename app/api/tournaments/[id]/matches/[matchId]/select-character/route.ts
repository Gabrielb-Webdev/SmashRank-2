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
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { characterId } = await request.json();

    if (!characterId) {
      return NextResponse.json(
        { error: 'Character ID requerido' },
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
      return NextResponse.json(
        { error: 'Game no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que estamos en fase de CHARACTER_SELECT
    if (currentGame.phase !== 'CHARACTER_SELECT') {
      return NextResponse.json(
        { error: `No es el momento de seleccionar personaje. Fase actual: ${currentGame.phase}` },
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

    // Actualizar selección de personaje
    const updateData: any = {};
    
    if (isPlayer1) {
      updateData.player1Character = characterId;
      
      // Si player2 ya seleccionó, avanzar a siguiente fase
      if (currentGame.player2Character) {
        // Ambos seleccionaron, pasar a stage ban/select
        if (currentGame.gameNumber === 1) {
          // Game 1: Banning phase (1-2-1 pattern)
          updateData.phase = 'STAGE_BAN';
          updateData.currentTurn = 'PLAYER1'; // Player 1 banea primero
          updateData.banTurnCount = 0;
        } else {
          // Games 2-3: Winner bans 3 stages
          updateData.phase = 'STAGE_BAN';
          // El ganador del juego anterior banea
          const winnerId = currentGame.previousWinnerId;
          updateData.currentTurn = winnerId === match.player1Id ? 'PLAYER1' : 'PLAYER2';
          updateData.banTurnCount = 0;
        }
      } else {
        // Esperar a player2
        updateData.currentTurn = 'PLAYER2';
      }
    } else {
      updateData.player2Character = characterId;
      
      // Si player1 ya seleccionó, avanzar a siguiente fase
      if (currentGame.player1Character) {
        // Ambos seleccionaron, pasar a stage ban/select
        if (currentGame.gameNumber === 1) {
          // Game 1: Banning phase (1-2-1 pattern)
          updateData.phase = 'STAGE_BAN';
          updateData.currentTurn = 'PLAYER1'; // Player 1 banea primero
          updateData.banTurnCount = 0;
        } else {
          // Games 2-3: Winner bans 3 stages
          updateData.phase = 'STAGE_BAN';
          // El ganador del juego anterior banea
          const winnerId = currentGame.previousWinnerId;
          updateData.currentTurn = winnerId === match.player1Id ? 'PLAYER1' : 'PLAYER2';
          updateData.banTurnCount = 0;
        }
      } else {
        // Esperar a player1
        updateData.currentTurn = 'PLAYER1';
      }
    }

    const updatedGame = await prisma.matchGame.update({
      where: { id: currentGame.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      game: updatedGame,
      message: `Personaje seleccionado exitosamente`,
      nextPhase: updateData.phase || 'CHARACTER_SELECT',
    });
  } catch (error) {
    console.error('Error al seleccionar personaje:', error);
    return NextResponse.json(
      { error: 'Error al procesar selección' },
      { status: 500 }
    );
  }
}
