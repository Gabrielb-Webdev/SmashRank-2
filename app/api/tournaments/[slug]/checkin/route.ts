import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const tournament = await prisma.tournament.findUnique({
      where: { slug: params.slug },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el check-in esté abierto
    const now = new Date();
    if (now < tournament.checkinStart || now > tournament.checkinEnd) {
      return NextResponse.json(
        { error: 'El check-in no está abierto en este momento' },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté inscrito
    const registration = await prisma.registration.findUnique({
      where: {
        userId_tournamentId: {
          userId: session.user.id,
          tournamentId: tournament.id,
        },
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
        { error: 'Ya hiciste check-in' },
        { status: 400 }
      );
    }

    // Hacer check-in
    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error('Error en check-in:', error);
    return NextResponse.json(
      { error: 'Error al hacer check-in' },
      { status: 500 }
    );
  }
}
