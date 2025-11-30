import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;

    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: {
        player1: {
          include: {
            registrations: {
              where: { tournamentId },
              include: {
                character: true,
                skin: true,
              },
            },
          },
        },
        player2: {
          include: {
            registrations: {
              where: { tournamentId },
              include: {
                character: true,
                skin: true,
              },
            },
          },
        },
        winner: true,
      },
      orderBy: [
        { round: 'asc' },
        { matchNumber: 'asc' },
      ],
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error al obtener brackets:', error);
    return NextResponse.json(
      { error: 'Error al obtener el bracket' },
      { status: 500 }
    );
  }
}
