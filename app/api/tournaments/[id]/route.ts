import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener detalles de un torneo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            character: true,
            skin: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
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

    // Agregar currentParticipants
    const tournamentWithParticipants = {
      ...tournament,
      currentParticipants: tournament.registrations.length,
    };

    return NextResponse.json(tournamentWithParticipants);
  } catch (error) {
    console.error('Error al obtener torneo:', error);
    return NextResponse.json(
      { error: 'Error al obtener el torneo' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un torneo
export async function PUT(
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

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      select: { createdById: true },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (
      tournament.createdById !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este torneo' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      format,
      maxParticipants,
      startDate,
      rules,
      stageList,
    } = body;

    // Calcular fechas automáticamente basadas en la nueva fecha de inicio
    // Parsear la fecha como hora local sin conversión UTC
    const dateStr = startDate;
    const [datePart, timePart] = dateStr.includes('T') ? dateStr.split('T') : [dateStr, '00:00'];
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const newStartDate = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    
    // Las inscripciones se mantienen abiertas hasta que inicie el torneo
    // El check-in se abre 30 minutos antes del inicio
    const registrationStart = now;
    const registrationEnd = newStartDate;
    const checkinStart = new Date(newStartDate.getTime() - 30 * 60 * 1000);
    const checkinEnd = newStartDate;

    const updatedTournament = await prisma.tournament.update({
      where: { id: params.id },
      data: {
        name,
        description,
        format,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        province: 'Online',
        isOnline: true,
        startDate: newStartDate,
        registrationStart,
        registrationEnd,
        checkinStart,
        checkinEnd,
        rules,
        stageList,
      },
    });

    return NextResponse.json(updatedTournament);
  } catch (error) {
    console.error('Error al actualizar torneo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el torneo' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un torneo
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

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      select: { createdById: true },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (
      tournament.createdById !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este torneo' },
        { status: 403 }
      );
    }

    // Eliminar el torneo (las relaciones se eliminan en cascada según el schema)
    await prisma.tournament.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar torneo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el torneo' },
      { status: 500 }
    );
  }
}
