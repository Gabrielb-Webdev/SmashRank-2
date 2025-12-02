import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Inscribirse en un torneo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('❌ Usuario no autenticado');
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { characterId, skinId } = body;

    console.log(`📝 Intento de registro en torneo ${params.id} por usuario ${session.user.id}`);

    // Verificar que el torneo existe y está abierto para inscripciones
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        registrations: true,
      },
    });

    if (!tournament) {
      console.log('❌ Torneo no encontrado');
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    console.log(`✅ Torneo encontrado: ${tournament.name}, status: ${tournament.status}`);

    // Verificar que el torneo permita inscripciones
    if (tournament.status !== 'REGISTRATION_OPEN') {
      return NextResponse.json(
        { error: `Las inscripciones no están abiertas. Status actual: ${tournament.status}` },
        { status: 400 }
      );
    }

    // Verificar fechas de inscripción solo si están definidas
    const now = new Date();
    if (tournament.registrationStart && now < tournament.registrationStart) {
      return NextResponse.json(
        { error: 'Las inscripciones aún no han abierto' },
        { status: 400 }
      );
    }

    if (tournament.registrationEnd && now > tournament.registrationEnd) {
      return NextResponse.json(
        { error: 'Las inscripciones han cerrado' },
        { status: 400 }
      );
    }

    // Verificar límite de participantes
    if (
      tournament.maxParticipants &&
      tournament.registrations.length >= tournament.maxParticipants
    ) {
      return NextResponse.json(
        { error: 'El torneo está lleno' },
        { status: 400 }
      );
    }

    // Verificar si ya está inscrito
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        tournamentId: params.id,
        userId: session.user.id,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en este torneo' },
        { status: 400 }
      );
    }

    // Verificar que el personaje y skin existen (si se proporcionan)
    if (characterId && skinId) {
      const [character, skin] = await Promise.all([
        prisma.character.findUnique({ where: { id: characterId } }),
        prisma.characterSkin.findUnique({ where: { id: skinId } }),
      ]);

      if (!character || !skin) {
        return NextResponse.json(
          { error: 'Personaje o skin inválido' },
          { status: 400 }
        );
      }

      if (skin.characterId !== characterId) {
        return NextResponse.json(
          { error: 'El skin no pertenece al personaje seleccionado' },
          { status: 400 }
        );
      }
    }

    // Crear inscripción
    const registration = await prisma.registration.create({
      data: {
        tournamentId: params.id,
        userId: session.user.id,
        ...(characterId && { characterId }),
        ...(skinId && { skinId }),
      },
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

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error al inscribirse:', error);
    return NextResponse.json(
      { error: 'Error al procesar la inscripción' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar inscripción
export async function DELETE(
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

    // No permitir cancelar si el torneo ya empezó
    const now = new Date();
    if (now > tournament.startDate) {
      return NextResponse.json(
        { error: 'No puedes cancelar la inscripción una vez iniciado el torneo' },
        { status: 400 }
      );
    }

    // Eliminar inscripción
    await prisma.registration.delete({
      where: { id: registration.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al cancelar inscripción:', error);
    return NextResponse.json(
      { error: 'Error al cancelar la inscripción' },
      { status: 500 }
    );
  }
}
