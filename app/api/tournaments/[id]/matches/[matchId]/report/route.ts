import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { advanceBracket } from '@/lib/brackets';

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

    // Avanzar el bracket
    const updatedMatches = advanceBracket(
      allMatches.map(m => ({
        id: m.id,
        tournamentId: m.tournamentId,
        bracketType: m.bracketType as any,
        round: m.round,
        matchNumber: m.matchNumber,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        player1Score: m.player1Score,
        player2Score: m.player2Score,
        winnerId: m.winnerId,
        status: m.status as any,
        nextMatchId: m.nextMatchId,
        loserNextMatchId: m.loserNextMatchId,
      })),
      matchId,
      winnerId!,
      loserId!
    );

    // Actualizar los matches afectados
    for (const updatedMatch of updatedMatches) {
      const dbMatch = allMatches.find(m => m.id === updatedMatch.id);
      if (dbMatch && (dbMatch.player1Id !== updatedMatch.player1Id || dbMatch.player2Id !== updatedMatch.player2Id)) {
        await prisma.match.update({
          where: { id: updatedMatch.id },
          data: {
            player1Id: updatedMatch.player1Id,
            player2Id: updatedMatch.player2Id,
          },
        });
      }
    }

    // Si el perdedor fue eliminado en single elimination, marcarlo
    if (match.tournament.format === 'SINGLE' && !match.loserNextMatchId) {
      await prisma.tournamentParticipant.updateMany({
        where: {
          tournamentId: match.tournamentId,
          userId: loserId!,
        },
        data: {
          status: 'ELIMINATED',
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
