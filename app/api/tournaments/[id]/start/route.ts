import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden iniciar torneos.' },
        { status: 403 }
      );
    }

    // Verificar que el torneo existe y tiene bracket
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        brackets: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    if (tournament.brackets.length === 0) {
      return NextResponse.json(
        { error: 'Debe generar el bracket antes de iniciar el torneo' },
        { status: 400 }
      );
    }

    if (tournament.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'El torneo ya está en progreso' },
        { status: 400 }
      );
    }

    // Obtener el bracket
    const bracket = tournament.brackets[0];
    const bracketData = bracket.data as any;

    // Crear los matches en la base de datos
    const matches: any[] = [];
    const now = new Date();
    const checkInDeadline = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutos

    // Winners bracket
    if (bracketData.winners) {
      for (const match of bracketData.winners) {
        matches.push({
          id: match.id,
          tournamentId: params.id,
          bracketType: 'WINNERS',
          round: match.roundNumber,
          matchNumber: match.matchNumber,
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          status: match.player1Id && match.player2Id ? 'CHECKIN' : 'PENDING',
          checkInDeadline: match.player1Id && match.player2Id ? checkInDeadline : null,
          bestOf: 3,
        });
      }
    }

    // Losers bracket
    if (bracketData.losers) {
      for (const match of bracketData.losers) {
        matches.push({
          id: match.id,
          tournamentId: params.id,
          bracketType: 'LOSERS',
          round: match.roundNumber,
          matchNumber: match.matchNumber,
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          status: 'PENDING',
          bestOf: 3,
        });
      }
    }

    // Grand Finals
    if (bracketData.grandFinals) {
      matches.push({
        id: bracketData.grandFinals.id,
        tournamentId: params.id,
        bracketType: 'GRANDS',
        round: 1,
        matchNumber: 1,
        player1Id: bracketData.grandFinals.player1Id,
        player2Id: bracketData.grandFinals.player2Id,
        status: 'PENDING',
        bestOf: 5, // Grand Finals es BO5
      });
    }

    // Crear todos los matches
    await prisma.match.createMany({
      data: matches,
      skipDuplicates: true,
    });

    // Actualizar estado del torneo
    await prisma.tournament.update({
      where: { id: params.id },
      data: { status: 'IN_PROGRESS' },
    });

    return NextResponse.json({
      success: true,
      message: 'Torneo iniciado exitosamente',
      matchesCreated: matches.length,
    });
  } catch (error) {
    console.error('Error al iniciar torneo:', error);
    return NextResponse.json(
      { error: 'Error al iniciar el torneo' },
      { status: 500 }
    );
  }
}
