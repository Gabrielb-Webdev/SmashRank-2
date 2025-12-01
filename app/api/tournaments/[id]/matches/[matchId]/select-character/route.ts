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
    const { gameNumber, characterId } = body;

    if (!gameNumber || !characterId) {
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

    if (game.status !== 'CHAR_SELECT') {
      return NextResponse.json(
        { error: 'Este game no está en fase de selección de personaje' },
        { status: 400 }
      );
    }

    // Determinar quién selecciona primero
    let selectFirst = false;
    let updateData: any = {};

    if (gameNumber === 1) {
      // Game 1: Player 1 selecciona primero
      if (isPlayer1 && !game.player1Character) {
        selectFirst = true;
        updateData.player1Character = characterId;
      } else if (isPlayer2 && game.player1Character && !game.player2Character) {
        updateData.player2Character = characterId;
        updateData.status = 'PLAYING';
      }
    } else {
      // Games 2+: Ganador selecciona primero
      const previousGame = await prisma.matchGame.findFirst({
        where: {
          matchId: params.matchId,
          gameNumber: gameNumber - 1,
        },
      });

      const winnerId = previousGame?.winnerId;
      const isWinner = winnerId === session.user.id;

      if (isWinner) {
        if (isPlayer1 && !game.player1Character) {
          updateData.player1Character = characterId;
        } else if (isPlayer2 && !game.player2Character) {
          updateData.player2Character = characterId;
        }
      } else {
        // El perdedor selecciona segundo
        if (isPlayer1 && game.player2Character && !game.player1Character) {
          updateData.player1Character = characterId;
          updateData.status = 'PLAYING';
        } else if (isPlayer2 && game.player1Character && !game.player2Character) {
          updateData.player2Character = characterId;
          updateData.status = 'PLAYING';
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No es tu turno para seleccionar personaje' },
        { status: 400 }
      );
    }

    const updatedGame = await prisma.matchGame.update({
      where: { id: game.id },
      data: updateData,
    });

    // Si ambos seleccionaron, actualizar el match
    if (updateData.status === 'PLAYING') {
      await prisma.match.update({
        where: { id: params.matchId },
        data: { status: 'PLAYING' },
      });
    }

    return NextResponse.json({
      success: true,
      game: updatedGame,
    });
  } catch (error) {
    console.error('Error al seleccionar personaje:', error);
    return NextResponse.json(
      { error: 'Error al seleccionar personaje' },
      { status: 500 }
    );
  }
}
