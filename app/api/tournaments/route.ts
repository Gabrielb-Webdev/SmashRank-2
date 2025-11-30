import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { slugify } from '@/lib/utils';

const tournamentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  province: z.string().min(1, 'Debes seleccionar una provincia'),
  isOnline: z.boolean().default(false),
  format: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS']),
  maxParticipants: z.number().optional(),
  startDate: z.string(),
  registrationStart: z.string(),
  registrationEnd: z.string(),
  checkinStart: z.string(),
  checkinEnd: z.string(),
  rules: z.string().optional(),
  stageList: z.string().optional(),
  ruleset: z.any().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const province = searchParams.get('province');
    const status = searchParams.get('status');
    const format = searchParams.get('format');

    const where: any = {};
    
    if (province && province !== 'all') {
      where.province = province;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (format && format !== 'all') {
      where.format = format;
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error al obtener torneos:', error);
    return NextResponse.json(
      { error: 'Error al obtener torneos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden crear torneos.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = tournamentSchema.parse(body);

    const slug = slugify(validatedData.name);

    // Verificar si el slug ya existe
    const existingTournament = await prisma.tournament.findUnique({
      where: { slug },
    });

    if (existingTournament) {
      return NextResponse.json(
        { error: 'Ya existe un torneo con ese nombre' },
        { status: 400 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        province: validatedData.province,
        isOnline: validatedData.isOnline,
        format: validatedData.format,
        maxParticipants: validatedData.maxParticipants,
        startDate: new Date(validatedData.startDate),
        registrationStart: new Date(validatedData.registrationStart),
        registrationEnd: new Date(validatedData.registrationEnd),
        checkinStart: new Date(validatedData.checkinStart),
        checkinEnd: new Date(validatedData.checkinEnd),
        rules: validatedData.rules,
        stageList: validatedData.stageList,
        ruleset: validatedData.ruleset,
        status: 'REGISTRATION_OPEN',
        createdById: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error al crear torneo:', error);
    return NextResponse.json(
      { error: 'Error al crear torneo' },
      { status: 500 }
    );
  }
}
