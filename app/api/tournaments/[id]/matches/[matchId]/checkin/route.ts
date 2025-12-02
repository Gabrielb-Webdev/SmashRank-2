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

    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
      include: {
        player1: true,
        player2: true,
        games: true,
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

    // Verificar que el match está PENDING o ONGOING
    if (match.status !== 'PENDING' && match.status !== 'ONGOING') {
      return NextResponse.json(
        { error: 'Este match no está disponible para check-in' },
        { status: 400 }
      );
    }

    // Verificar que el usuario es participante del match
    if (match.player1Id !== session.user.id && match.player2Id !== session.user.id) {
      return NextResponse.json(
        { error: 'No eres participante de este match' },
        { status: 403 }
      );
    }

    // Verificar deadline
    if (match.checkInDeadline && new Date() > match.checkInDeadline) {
      return NextResponse.json(
        { error: 'El tiempo de check-in ha expirado' },
        { status: 400 }
      );
    }

    const isPlayer1 = match.player1Id === session.user.id;
    const updateData: any = {};

    if (isPlayer1) {
      if (match.player1CheckIn) {
        return NextResponse.json(
          { error: 'Ya hiciste check-in' },
          { status: 400 }
        );
      }
      updateData.player1CheckIn = true;
    } else {
      if (match.player2CheckIn) {
        return NextResponse.json(
          { error: 'Ya hiciste check-in' },
          { status: 400 }
        );
      }
      updateData.player2CheckIn = true;
    }

    // Si ambos jugadores hicieron check-in, inicializar primer game
    const bothCheckedIn = isPlayer1
      ? match.player2CheckIn
      : match.player1CheckIn;

    if (bothCheckedIn) {
      updateData.status = 'ONGOING';
      updateData.currentGame = 1;
    }

    const updatedMatch = await prisma.match.update({
      where: { id: params.matchId },
      data: updateData,
      include: {
        player1: true,
        player2: true,
        games: true,
      },
    });

    // Crear primer game si ambos están listos y no existe
    if (bothCheckedIn && match.games.length === 0) {
      await prisma.matchGame.create({
        data: {
          matchId: params.matchId,
          gameNumber: 1,
          phase: 'CHARACTER_SELECT',
          currentTurn: 'PLAYER1', // Player 1 selecciona personaje primero en game 1
          status: 'IN_PROGRESS',
        },
      });
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      bothReady: bothCheckedIn,
      message: bothCheckedIn 
        ? 'Ambos jugadores listos! El match puede comenzar.' 
        : 'Check-in exitoso. Esperando al otro jugador.',
    });
  } catch (error) {
    console.error('Error al hacer check-in:', error);
    return NextResponse.json(
      { error: 'Error al procesar el check-in' },
      { status: 500 }
    );
  }
}
