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

    const { characterId, skinId } = await req.json();

    if (!characterId || !skinId) {
      return NextResponse.json(
        { error: 'Debes seleccionar un personaje y skin' },
        { status: 400 }
      );
    }

    const tournament = await prisma.tournament.findUnique({
      where: { slug: params.slug },
      include: {
        _count: {
          select: {
            registrations: true,
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

    // Verificar que las inscripciones estén abiertas
    const now = new Date();
    if (now < tournament.registrationStart || now > tournament.registrationEnd) {
      return NextResponse.json(
        { error: 'Las inscripciones no están abiertas' },
        { status: 400 }
      );
    }

    // Verificar que no esté lleno
    if (tournament.maxParticipants && tournament._count.registrations >= tournament.maxParticipants) {
      return NextResponse.json(
        { error: 'El torneo está lleno' },
        { status: 400 }
      );
    }

    // Verificar que no esté ya inscrito
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_tournamentId: {
          userId: session.user.id,
          tournamentId: tournament.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en este torneo' },
        { status: 400 }
      );
    }

    // Crear inscripción
    const registration = await prisma.registration.create({
      data: {
        userId: session.user.id,
        tournamentId: tournament.id,
        characterId,
        skinId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            province: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        skin: {
          select: {
            id: true,
            name: true,
            number: true,
            image: true,
          },
        },
      },
    });

    // Actualizar contador de participantes
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        currentParticipants: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Error al registrarse:', error);
    return NextResponse.json(
      { error: 'Error al registrarse en el torneo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.registration.delete({
      where: {
        id: registration.id,
      },
    });

    // Actualizar contador de participantes
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        currentParticipants: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Inscripción cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar inscripción:', error);
    return NextResponse.json(
      { error: 'Error al cancelar inscripción' },
      { status: 500 }
    );
  }
}
