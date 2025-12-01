import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const TOURNAMENT_ID = 'cmimlfhr50001oqkmqg7txwzs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Verificar que el torneo existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: TOURNAMENT_ID }
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [];
    const registrations = [];

    // Crear 29 usuarios
    for (let i = 1; i <= 29; i++) {
      const username = `Player${i}`;
      const email = `player${i}@test.com`;

      // Verificar si ya existe
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      let userId;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Crear usuario con stats aleatorios
        const wins = Math.floor(Math.random() * 50);
        const losses = Math.floor(Math.random() * 50);
        const points = wins * 10 - losses * 3;

        const user = await prisma.user.create({
          data: {
            email,
            username,
            password: hashedPassword,
            role: 'USER',
            wins,
            losses,
            points: Math.max(0, points),
          }
        });

        userId = user.id;
        users.push(user);
      }

      // Verificar si ya está inscrito
      const existingRegistration = await prisma.registration.findFirst({
        where: {
          userId,
          tournamentId: TOURNAMENT_ID
        }
      });

      if (!existingRegistration) {
        // Inscribir al usuario
        const registration = await prisma.registration.create({
          data: {
            userId,
            tournamentId: TOURNAMENT_ID,
            checkedIn: true,
          }
        });

        registrations.push(registration);
      }
    }

    return NextResponse.json({
      success: true,
      usersCreated: users.length,
      registrationsCreated: registrations.length,
      tournamentId: TOURNAMENT_ID,
      message: `${users.length} usuarios nuevos creados, ${registrations.length} inscripciones nuevas`
    });

  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { error: 'Error al crear datos de prueba' },
      { status: 500 }
    );
  }
}
