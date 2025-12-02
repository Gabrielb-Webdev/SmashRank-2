import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { propagateMatchResult } from '@/lib/doubleElimination';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { winnerId, player1Score, player2Score } = await request.json();
    const { matchId } = params;

    // Obtener el match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario sea admin o uno de los jugadores
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const isAdmin = user?.role === 'ADMIN';
    const isPlayer = match.player1Id === session.user.id || match.player2Id === session.user.id;

    if (!isAdmin && !isPlayer) {
      return NextResponse.json(
        { error: 'No tienes permiso para reportar este resultado' },
        { status: 403 }
      );
    }

    // Determinar el perdedor
    const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;

    // Actualizar el match
    await prisma.match.update({
      where: { id: matchId },
      data: {
        winnerId,
        player1Score,
        player2Score,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Obtener todos los matches del torneo
    const allMatches = await prisma.match.findMany({
      where: { tournamentId: match.tournamentId },
    });

    // Construir el objeto Bracket para propagateMatchResult
    const bracket = {
      winners: allMatches.filter(m => m.bracketType === 'WINNERS'),
      losers: allMatches.filter(m => m.bracketType === 'LOSERS'),
      grandFinals: allMatches.find(m => m.bracketType === 'GRANDS'),
    };

    // Propagar resultado usando el nuevo sistema
    const updatedBracket = propagateMatchResult(bracket, matchId, winnerId!, loserId!);

    // Actualizar los matches afectados en la base de datos
    const allUpdatedMatches = [
      ...updatedBracket.winners,
      ...updatedBracket.losers,
      ...(updatedBracket.grandFinals ? [updatedBracket.grandFinals] : []),
    ];

    for (const affectedMatch of allUpdatedMatches) {
      await prisma.match.update({
        where: { id: affectedMatch.id },
        data: {
          player1Id: affectedMatch.player1Id,
          player2Id: affectedMatch.player2Id,
          winnerId: affectedMatch.winnerId,
          loserId: affectedMatch.loserId,
          status: affectedMatch.status,
        },
      });
    }

    // Actualizar el estado del jugador eliminado si perdió en losers bracket
    if (match.bracketType === 'LOSERS' && !match.nextLoserMatchId) {
      await prisma.registration.updateMany({
        where: {
          tournamentId: match.tournamentId,
          userId: loserId,
        },
        data: {
          status: 'ELIMINATED',
          currentBracket: 'LOSERS',
        },
      });
    }

    return NextResponse.json({
      message: 'Resultado reportado exitosamente',
      match: await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          player1: true,
          player2: true,
          winner: true,
        },
      }),
    });
  } catch (error) {
    console.error('Error al reportar resultado:', error);
    return NextResponse.json(
      { error: 'Error al reportar el resultado' },
      { status: 500 }
    );
  }
}
