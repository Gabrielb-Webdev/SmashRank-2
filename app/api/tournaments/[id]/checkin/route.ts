import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Hacer check-in
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que el torneo existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar fechas de check-in
    const now = new Date();
    if (now < tournament.checkinStart) {
      return NextResponse.json(
        { error: 'El check-in aún no ha abierto' },
        { status: 400 }
      );
    }

    if (now > tournament.checkinEnd) {
      return NextResponse.json(
        { error: 'El check-in ha cerrado' },
        { status: 400 }
      );
    }

    // Verificar que está inscrito
    const registration = await prisma.registration.findFirst({
      where: {
        tournamentId: params.id,
        userId: session.user.id,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'No estás inscrito en este torneo' },
        { status: 400 }
      );
    }

    if (registration.checkedIn) {
      return NextResponse.json(
        { error: 'Ya has hecho check-in' },
        { status: 400 }
      );
    }

    // Actualizar check-in
    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: { checkedIn: true },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        character: true,
        skin: true,
      },
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error('Error al hacer check-in:', error);
    return NextResponse.json(
      { error: 'Error al procesar el check-in' },
      { status: 500 }
    );
  }
}
