import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDoubleEliminationBracket, assignSeeds, generateSeedBadge } from '@/lib/doubleElimination';

// POST - Generar bracket para el torneo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden generar brackets.' },
        { status: 403 }
      );
    }

    // Obtener el torneo con todas las inscripciones que hicieron check-in
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todas las registraciones
    const registrations = await prisma.registration.findMany({
      where: {
        tournamentId: params.id,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Verificar que hay suficientes participantes
    if (registrations.length < 2) {
      return NextResponse.json(
        { error: 'Se necesitan al menos 2 participantes para generar el bracket' },
        { status: 400 }
      );
    }

    // Asignar seeds basados en el ranking
    const playersWithSeeds = assignSeeds(registrations);

    // Actualizar los seeds y seedBadges en la base de datos
    await Promise.all(
      playersWithSeeds.map(player =>
        prisma.registration.update({
          where: { id: player.registrationId },
          data: { 
            seed: player.seed,
            seedBadge: generateSeedBadge(player.seed, playersWithSeeds.length) as string,
          } as any,
        })
      )
    );

    // Generar el bracket con Double Elimination
    const bracket = generateDoubleEliminationBracket(params.id, playersWithSeeds);

    // Guardar el bracket en la base de datos
    const existingBracket = await prisma.bracket.findFirst({
      where: { tournamentId: params.id },
    });

    if (existingBracket) {
      // Eliminar matches anteriores si existen
      await prisma.match.deleteMany({
        where: { tournamentId: params.id },
      });
      
      await prisma.bracket.update({
        where: { id: existingBracket.id },
        data: { data: bracket as any },
      });
    } else {
      await prisma.bracket.create({
        data: {
          tournamentId: params.id,
          type: 'double_elimination',
          data: bracket as any,
        },
      });
    }
    
    // Crear matches en la base de datos
    const allMatches = [
      ...bracket.winners,
      ...bracket.losers,
      ...(bracket.grandFinals ? [bracket.grandFinals] : []),
    ];
    
    await prisma.match.createMany({
      data: allMatches.map(match => ({
        id: match.id,
        tournamentId: match.tournamentId,
        bracketType: match.bracketType,
        roundName: match.roundName,
        roundNumber: match.roundNumber,
        position: match.position,
        player1Id: match.player1Id,
        player1Source: match.player1Source,
        player2Id: match.player2Id,
        player2Source: match.player2Source,
        player1Score: match.player1Score,
        player2Score: match.player2Score,
        winnerId: match.winnerId,
        loserId: match.loserId,
        status: match.status,
        scheduledTime: match.scheduledTime,
        nextMatchId: match.nextMatchId,
        nextLoserMatchId: match.nextLoserMatchId,
        previousMatch1Id: match.previousMatch1Id,
        previousMatch2Id: match.previousMatch2Id,
        streamUrl: match.streamUrl,
        isLive: match.isLive,
        round: match.roundNumber, // Compatibilidad con campo antiguo
        matchNumber: match.position,
      })),
    });

    return NextResponse.json({
      success: true,
      bracket,
      participants: playersWithSeeds.length,
    });
  } catch (error) {
    console.error('Error al generar bracket:', error);
    return NextResponse.json(
      { error: 'Error al generar el bracket' },
      { status: 500 }
    );
  }
}

// GET - Obtener bracket del torneo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bracket = await prisma.bracket.findFirst({
      where: { tournamentId: params.id },
      include: {
        tournament: {
          include: {
            registrations: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!bracket) {
      return NextResponse.json(
        { error: 'Bracket no encontrado. Debe generarse primero.' },
        { status: 404 }
      );
    }

    return NextResponse.json(bracket);
  } catch (error) {
    console.error('Error al obtener bracket:', error);
    return NextResponse.json(
      { error: 'Error al obtener el bracket' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar resultado de un match
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { matchId, winnerId, loserId, score } = body;

    if (!matchId || !winnerId || !loserId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Obtener el bracket actual
    const currentBracket = await prisma.bracket.findFirst({
      where: { tournamentId: params.id },
    });

    if (!currentBracket) {
      return NextResponse.json(
        { error: 'Bracket no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el match en el bracket
    const bracketData = currentBracket.data as any;
    
    // Buscar y actualizar el match
    const updateMatch = (matches: any[]) => {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        match.winnerId = winnerId;
        match.loserId = loserId;
        match.score = score;
        return true;
      }
      return false;
    };

    let updated = updateMatch(bracketData.winners || []);
    if (!updated) updated = updateMatch(bracketData.losers || []);
    if (!updated && bracketData.grandFinals?.id === matchId) {
      bracketData.grandFinals.winnerId = winnerId;
      bracketData.grandFinals.loserId = loserId;
      bracketData.grandFinals.score = score;
      updated = true;
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Match no encontrado' },
        { status: 404 }
      );
    }

    // Guardar el bracket actualizado
    await prisma.bracket.update({
      where: { id: currentBracket.id },
      data: { data: bracketData as any },
    });

    return NextResponse.json({
      success: true,
      bracket: bracketData,
    });
  } catch (error) {
    console.error('Error al actualizar match:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el match' },
      { status: 500 }
    );
  }
}
