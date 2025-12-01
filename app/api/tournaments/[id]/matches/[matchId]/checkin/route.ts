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

    if (match.status !== 'CHECKIN') {
      return NextResponse.json(
        { error: 'Este match no está en fase de check-in' },
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

    // Actualizar check-in
    const isPlayer1 = match.player1Id === session.user.id;
    const updateData: any = {};

    if (isPlayer1) {
      updateData.player1CheckIn = true;
    } else {
      updateData.player2CheckIn = true;
    }

    // Si ambos jugadores hicieron check-in, cambiar estado a BANNING y crear primer game
    const bothCheckedIn = isPlayer1
      ? match.player2CheckIn
      : match.player1CheckIn;

    if (bothCheckedIn) {
      updateData.status = 'BANNING';
      updateData.startedAt = new Date();
    }

    const updatedMatch = await prisma.match.update({
      where: { id: params.matchId },
      data: updateData,
    });

    // Crear primer game si ambos están listos
    if (bothCheckedIn) {
      await prisma.matchGame.create({
        data: {
          matchId: params.matchId,
          gameNumber: 1,
          status: 'BANNING',
        },
      });
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      bothReady: bothCheckedIn,
    });
  } catch (error) {
    console.error('Error al hacer check-in:', error);
    return NextResponse.json(
      { error: 'Error al procesar el check-in' },
      { status: 500 }
    );
  }
}
