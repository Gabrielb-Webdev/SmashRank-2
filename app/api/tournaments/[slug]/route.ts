import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { slug: params.slug },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
            province: true,
          },
        },
        registrations: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
        brackets: {
          include: {
            matches: {
              include: {
                player1: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
                player2: {
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

    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error al obtener torneo:', error);
    return NextResponse.json(
      { error: 'Error al obtener torneo' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Solo el creador o un admin pueden editar
    if (tournament.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updatedTournament = await prisma.tournament.update({
      where: { slug: params.slug },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        registrationStart: body.registrationStart ? new Date(body.registrationStart) : undefined,
        registrationEnd: body.registrationEnd ? new Date(body.registrationEnd) : undefined,
        checkinStart: body.checkinStart ? new Date(body.checkinStart) : undefined,
        checkinEnd: body.checkinEnd ? new Date(body.checkinEnd) : undefined,
      },
    });

    return NextResponse.json(updatedTournament);
  } catch (error) {
    console.error('Error al actualizar torneo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar torneo' },
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

    // Solo el creador o un admin pueden eliminar
    if (tournament.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await prisma.tournament.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ message: 'Torneo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar torneo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar torneo' },
      { status: 500 }
    );
  }
}
