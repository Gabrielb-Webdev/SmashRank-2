import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Nombres ficticios para generar usuarios
const firstNames = [
  'Mario', 'Luigi', 'Peach', 'Bowser', 'Yoshi', 'Donkey', 'Link', 'Zelda', 'Samus',
  'Kirby', 'Fox', 'Pikachu', 'Jigglypuff', 'Ness', 'Captain', 'Falcon', 'Ice',
  'Marth', 'Roy', 'Ganondorf', 'Mewtwo', 'Meta', 'Pit', 'Wario', 'Ike', 'Lucas',
  'Diddy', 'Sonic', 'Snake', 'Olimar', 'Lucario', 'Toon', 'Wolf', 'Villager',
  'Mega', 'Wii', 'Rosalina', 'Little', 'Mac', 'Greninja', 'Palutena', 'Robin',
  'Shulk', 'Bowser', 'Duck', 'Ryu', 'Ken', 'Cloud', 'Corrin', 'Bayonetta',
  'Inkling', 'Ridley', 'Simon', 'Richter', 'King', 'Isabelle', 'Incineroar',
  'Joker', 'Hero', 'Banjo', 'Terry', 'Byleth', 'Min', 'Steve', 'Sephiroth',
  'Pyra', 'Mythra', 'Kazuya', 'Sora'
];

const lastNames = [
  'Pro', 'Master', 'God', 'King', 'Ace', 'Star', 'Legend', 'Champion', 'Hero',
  'Warrior', 'Fighter', 'Slayer', 'Beast', 'Dragon', 'Phoenix', 'Thunder', 'Storm',
  'Blade', 'Shadow', 'Light', 'Dark', 'Fire', 'Ice', 'Wind', 'Earth', 'Sky'
];

const generateUsername = (index: number): string => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName}${lastName}${index}`;
};

const generateEmail = (username: string): string => {
  return `${username.toLowerCase()}@test.com`;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const { tournamentId, participantCount } = await req.json();

    if (!tournamentId || !participantCount) {
      return NextResponse.json(
        { error: 'tournamentId y participantCount son requeridos' },
        { status: 400 }
      );
    }

    console.log(`💉 Iniciando inyección de ${participantCount} participantes al torneo ${tournamentId}...`);

    // Verificar que el torneo existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    console.log(`📋 Torneo encontrado: ${tournament.name}`);
    console.log(`👥 Participantes actuales: ${tournament.registrations.length}`);

    // Obtener un personaje aleatorio
    const characters = await prisma.character.findMany({
      take: 1,
    });

    const characterId = characters[0]?.id;

    const createdUsers = [];
    const createdRegistrations = [];

    // Crear usuarios y registrarlos
    for (let i = 0; i < participantCount; i++) {
      const username = generateUsername(i + tournament.registrations.length);
      const email = generateEmail(username);

      console.log(`👤 Creando usuario ${i + 1}/${participantCount}: ${username}`);

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: 'dummy_hash_' + Math.random(), // Password dummy
          province: 'Buenos Aires',
          role: 'USER',
        },
      });

      createdUsers.push(user);

      // Registrar al usuario en el torneo
      const registration = await prisma.registration.create({
        data: {
          userId: user.id,
          tournamentId: tournament.id,
          characterId: characterId || undefined,
          status: 'ACTIVE',
          currentBracket: 'WINNERS',
        },
      });

      createdRegistrations.push(registration);
    }

    // Actualizar currentParticipants del torneo
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currentParticipants: tournament.registrations.length + participantCount,
      },
    });

    console.log(`✅ ${participantCount} participantes inyectados exitosamente!`);
    console.log(`👥 Total de participantes: ${updatedTournament.currentParticipants}`);

    return NextResponse.json({
      success: true,
      message: `${participantCount} participantes inyectados exitosamente`,
      tournament: {
        id: updatedTournament.id,
        name: updatedTournament.name,
        currentParticipants: updatedTournament.currentParticipants,
        maxParticipants: updatedTournament.maxParticipants,
      },
      createdUsers: createdUsers.map(u => ({ id: u.id, username: u.username })),
    });

  } catch (error: any) {
    console.error('❌ Error al inyectar participantes:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });

    return NextResponse.json(
      {
        error: 'Error al inyectar participantes',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
