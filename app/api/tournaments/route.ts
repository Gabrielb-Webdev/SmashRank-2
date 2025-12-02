import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { slugify } from '@/lib/utils';

const tournamentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().default(''),
  isOnline: z.boolean().optional().default(true),
  format: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS', 'CREW_BATTLE']),
  maxParticipants: z.number().positive().default(16),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  rules: z.string().default(''),
  stageList: z.string().default('Battlefield, Final Destination, Smashville'),
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

    // Actualizar currentParticipants basado en el conteo real
    const tournamentsWithParticipants = tournaments.map(tournament => {
      const { _count, ...rest } = tournament;
      return {
        ...rest,
        currentParticipants: _count.registrations,
      };
    });

    return NextResponse.json(tournamentsWithParticipants);
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
    console.log('Body recibido:', JSON.stringify(body, null, 2));
    
    const validatedData = tournamentSchema.parse(body);
    console.log('Datos validados:', JSON.stringify(validatedData, null, 2));

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

    // Calcular fechas automáticamente
    // La fecha viene como string "2025-11-30T23:59" en hora de Argentina
    // Agregamos el timezone de Argentina para que se interprete correctamente
    const startDateArg = `${validatedData.startDate}:00-03:00`; // Añade segundos y UTC-3 (Argentina)
    const startDate = new Date(startDateArg);
    const now = new Date();
    
    // Las inscripciones se abren inmediatamente y cierran cuando inicia el torneo
    // El check-in se abre 30 minutos antes del inicio y cierra cuando inicia el torneo
    // Durante esos 30 minutos la gente puede inscribirse Y hacer check-in
    const registrationStart = now;
    const registrationEnd = startDate; // Inscripciones abiertas hasta el inicio
    const checkinStart = new Date(startDate.getTime() - 30 * 60 * 1000);
    const checkinEnd = startDate;

    const tournament = await prisma.tournament.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || '',
        province: 'ONLINE',
        isOnline: true,
        format: validatedData.format,
        maxParticipants: validatedData.maxParticipants,
        currentParticipants: 0,
        startDate,
        registrationStart,
        registrationEnd,
        checkinStart,
        checkinEnd,
        rules: validatedData.rules || '',
        stageList: validatedData.stageList || 'Battlefield, Final Destination, Smashville',
        ruleset: validatedData.ruleset || {},
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
      console.error('❌ Error de validación:', error.errors);
      return NextResponse.json(
        { 
          error: error.errors[0].message,
          validationErrors: error.errors
        },
        { status: 400 }
      );
    }

    console.error('❌ Error al crear torneo:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Error al crear torneo',
        details: error.message,
        code: error.code,
        meta: error.meta
      },
      { status: 500 }
    );
  }
}
