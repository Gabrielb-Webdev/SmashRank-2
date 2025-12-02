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
    const { gameNumber, winnerId, confirm } = body;

    if (!gameNumber || !winnerId) {
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
    const isAdmin = session.user.role === 'ADMIN';

    if (!isPlayer1 && !isPlayer2 && !isAdmin) {
      return NextResponse.json(
        { error: 'No eres participante de este match' },
        { status: 403 }
      );
    }

    const game = match.games[0];
    if (!game) {
      return NextResponse.json({ error: 'Game no encontrado' }, { status: 404 });
    }

    if (game.status !== 'PLAYING' && game.status !== 'REPORTING') {
      return NextResponse.json(
        { error: 'Este game no está en fase de juego' },
        { status: 400 }
      );
    }

    // Verificar que el winnerId es válido
    if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
      return NextResponse.json(
        { error: 'Winner ID inválido' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    // Si es admin, puede confirmar directamente
    if (isAdmin) {
      updateData = {
        winnerId,
        reportedBy: session.user.id,
        confirmedBy: session.user.id,
        status: 'COMPLETED',
      };
    } else if (!game.reportedBy) {
      // Primer reporte
      updateData = {
        winnerId,
        reportedBy: session.user.id,
        status: 'REPORTING',
      };
    } else if (game.reportedBy === session.user.id) {
      return NextResponse.json(
        { error: 'Ya reportaste este resultado. Espera la confirmación del oponente.' },
        { status: 400 }
      );
    } else if (game.winnerId === winnerId) {
      // Confirmación del resultado
      updateData = {
        confirmedBy: session.user.id,
        status: 'COMPLETED',
      };
    } else {
      return NextResponse.json(
        { error: 'El resultado reportado no coincide. Contacta a un admin.' },
        { status: 400 }
      );
    }

    const updatedGame = await prisma.matchGame.update({
      where: { id: game.id },
      data: updateData,
    });

    // Si el game está completado, verificar si el match está completo
    if (updateData.status === 'COMPLETED') {
      const allGames = await prisma.matchGame.findMany({
        where: { matchId: params.matchId },
        orderBy: { gameNumber: 'asc' },
      });

      // Contar wins
      const player1Wins = allGames.filter((g) => g.winnerId === match.player1Id && g.status === 'COMPLETED').length;
      const player2Wins = allGames.filter((g) => g.winnerId === match.player2Id && g.status === 'COMPLETED').length;

      const requiredWins = Math.ceil(match.bestOf / 2);

      let matchWinnerId = null;
      let matchCompleted = false;

      if (player1Wins >= requiredWins) {
        matchWinnerId = match.player1Id;
        matchCompleted = true;
      } else if (player2Wins >= requiredWins) {
        matchWinnerId = match.player2Id;
        matchCompleted = true;
      }

      // Actualizar DSR tracking: agregar stage a la lista del ganador
      const gameWinnerId = updatedGame.winnerId;
      const wonStage = updatedGame.selectedStage;
      
      if (gameWinnerId && wonStage) {
        if (gameWinnerId === match.player1Id) {
          await prisma.match.update({
            where: { id: params.matchId },
            data: {
              player1WonStages: {
                push: wonStage,
              },
            },
          });
        } else if (gameWinnerId === match.player2Id) {
          await prisma.match.update({
            where: { id: params.matchId },
            data: {
              player2WonStages: {
                push: wonStage,
              },
            },
          });
        }
      }

      if (matchCompleted) {
        // Actualizar match completo
        await prisma.match.update({
          where: { id: params.matchId },
          data: {
            winnerId: matchWinnerId,
            loserId: matchWinnerId === match.player1Id ? match.player2Id : match.player1Id,
            status: 'COMPLETED',
            completedAt: new Date(),
            player1Score: player1Wins,
            player2Score: player2Wins,
          },
        });

        // TODO: Avanzar ganador al siguiente match en el bracket
        // Aquí deberías implementar la lógica para actualizar el bracket
      } else {
        // Crear el siguiente game con la configuración correcta
        const nextGameNumber = gameNumber + 1;
        
        // Games 2-3: El ganador selecciona personaje primero
        const gameTwoOrThreeFirstTurn = gameWinnerId === match.player1Id ? 'PLAYER1' : 'PLAYER2';
        
        await prisma.matchGame.create({
          data: {
            matchId: params.matchId,
            gameNumber: nextGameNumber,
            phase: 'CHARACTER_SELECT',
            currentTurn: gameTwoOrThreeFirstTurn, // Ganador selecciona personaje primero
            previousWinnerId: gameWinnerId, // Guardar ganador del juego anterior
            status: 'IN_PROGRESS',
          },
        });

        await prisma.match.update({
          where: { id: params.matchId },
          data: {
            status: 'ONGOING',
            currentGame: nextGameNumber,
            player1Score: player1Wins,
            player2Score: player2Wins,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      game: updatedGame,
      needsConfirmation: updateData.status === 'REPORTING',
    });
  } catch (error) {
    console.error('Error al reportar resultado:', error);
    return NextResponse.json(
      { error: 'Error al reportar resultado' },
      { status: 500 }
    );
  }
}
