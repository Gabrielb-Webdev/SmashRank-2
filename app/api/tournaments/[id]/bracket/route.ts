import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDoubleEliminationBracket, assignSeeds } from '@/lib/bracket';

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
      include: {
        registrations: {
          where: {
            checkedIn: true, // Solo los que hicieron check-in participan
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                wins: true,
                losses: true,
                points: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que hay suficientes participantes
    if (tournament.registrations.length < 2) {
      return NextResponse.json(
        { error: 'Se necesitan al menos 2 participantes con check-in para generar el bracket' },
        { status: 400 }
      );
    }

    // Asignar seeds basados en el ranking
    const playersWithSeeds = assignSeeds(tournament.registrations);

    // Actualizar los seeds en la base de datos
    await Promise.all(
      playersWithSeeds.map(player =>
        prisma.registration.update({
          where: { id: player.registrationId },
          data: { seed: player.seed },
        })
      )
    );

    // Generar el bracket
    const bracket = generateDoubleEliminationBracket(playersWithSeeds);

    // Guardar el bracket en la base de datos
    await prisma.bracket.upsert({
      where: { tournamentId: params.id },
      create: {
        tournamentId: params.id,
        type: 'double_elimination',
        data: bracket,
      },
      update: {
        data: bracket,
      },
    });

    // Actualizar el estado del torneo
    await prisma.tournament.update({
      where: { id: params.id },
      data: { status: 'IN_PROGRESS' },
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
    const bracket = await prisma.bracket.findUnique({
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
    const currentBracket = await prisma.bracket.findUnique({
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
      where: { tournamentId: params.id },
      data: { data: bracketData },
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
