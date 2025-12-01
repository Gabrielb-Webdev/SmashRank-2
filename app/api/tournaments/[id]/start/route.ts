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

    // Crear solo los matches de la PRIMERA RONDA con ambos jugadores
    const matches: any[] = [];
    const now = new Date();
    const checkInDeadline = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutos

    // Winners bracket - Solo ronda 1
    if (bracketData.winners) {
      const firstRoundMatches = bracketData.winners.filter(
        (match: any) => match.roundNumber === 1 && match.player1Id && match.player2Id
      );
      
      for (const match of firstRoundMatches) {
        matches.push({
          id: match.id,
          tournamentId: params.id,
          bracketType: 'WINNERS',
          round: match.roundNumber,
          matchNumber: match.matchNumber,
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          status: 'CHECKIN',
          checkInDeadline: checkInDeadline,
          player1CheckIn: false,
          player2CheckIn: false,
          currentGame: 1,
          bestOf: 3,
        });
      }
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
