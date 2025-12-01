import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSingleEliminationBracket, generateDoubleEliminationBracket } from '@/lib/brackets';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario sea admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo los admins pueden generar brackets' }, { status: 403 });
    }

    const tournamentId = params.id;

    // Obtener el torneo con todos los participantes
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          include: {
            user: true,
            character: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    // Verificar que haya suficientes participantes
    if (tournament.registrations.length < 2) {
      return NextResponse.json(
        { error: 'Se necesitan al menos 2 participantes para generar el bracket' },
        { status: 400 }
      );
    }

    // Asignar seeds aleatorios si no los tienen
    const participantsWithSeeds = tournament.registrations.map((p, idx) => ({
      id: p.id,
      userId: p.userId,
      seed: p.seed || idx + 1,
      eliminated: false,
    }));

    // Generar bracket según el formato
    let bracketMatches;
    if (tournament.format === 'DOUBLE_ELIMINATION') {
      bracketMatches = generateDoubleEliminationBracket(participantsWithSeeds, tournamentId);
    } else {
      bracketMatches = generateSingleEliminationBracket(participantsWithSeeds, tournamentId);
    }

    // Guardar matches en la base de datos
    const matchPromises = bracketMatches.map((match) =>
      prisma.match.create({
        data: {
          id: match.id,
          tournamentId: match.tournamentId,
          bracketType: match.bracketType,
          round: match.round,
          matchNumber: match.matchNumber,
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          player1Score: match.player1Score,
          player2Score: match.player2Score,
          winnerId: match.winnerId,
          status: match.status,
          nextMatchId: match.nextMatchId,
          loserNextMatchId: match.loserNextMatchId,
        },
      })
    );

    await Promise.all(matchPromises);

    // Actualizar el estado del torneo
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'IN_PROGRESS' },
    });

    return NextResponse.json({
      message: 'Bracket generado exitosamente',
      matchCount: bracketMatches.length,
    });
  } catch (error) {
    console.error('Error al generar bracket:', error);
    return NextResponse.json(
      { error: 'Error al generar el bracket' },
      { status: 500 }
    );
  }
}
