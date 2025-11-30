import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Endpoint de inicialización de base de datos
 * Solo ejecutar una vez para crear estructura y datos iniciales
 * GET /api/init-db
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar si ya hay datos (para no duplicar)
    const existingUsers = await prisma.user.count();
    
    if (existingUsers > 0) {
      return NextResponse.json({
        message: 'Base de datos ya inicializada',
        users: existingUsers,
      });
    }

    // Hash de contraseñas
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // 1. Crear usuarios de prueba
    const users = await Promise.all([
      // Admin
      prisma.user.create({
        data: {
          email: 'admin@smashrank.ar',
          username: 'admin',
          password: adminPassword,
          role: 'ADMIN',
          province: 'Buenos Aires',
          bio: 'Administrador principal de SmashRank',
        },
      }),
      // Usuarios normales
      prisma.user.create({
        data: {
          email: 'user1@smashrank.ar',
          username: 'MarioMain',
          password: userPassword,
          role: 'USER',
          province: 'Buenos Aires',
          bio: 'Main Mario, jugador competitivo',
        },
      }),
      prisma.user.create({
        data: {
          email: 'user2@smashrank.ar',
          username: 'FoxPlayer',
          password: userPassword,
          role: 'USER',
          province: 'Córdoba',
          bio: 'Main Fox, siempre top 8',
        },
      }),
      prisma.user.create({
        data: {
          email: 'user3@smashrank.ar',
          username: 'PikachuKing',
          password: userPassword,
          role: 'USER',
          province: 'Santa Fe',
          bio: 'Jugador de Pikachu, amante de los edgeguards',
        },
      }),
      prisma.user.create({
        data: {
          email: 'user4@smashrank.ar',
          username: 'CloudStriker',
          password: userPassword,
          role: 'USER',
          province: 'Mendoza',
          bio: 'Main Cloud, buscando mejorar mi neutral',
        },
      }),
    ]);

    // 2. Crear algunos personajes principales
    const characters = await Promise.all([
      prisma.character.create({
        data: {
          name: 'Mario',
          slug: 'mario',
          icon: '🔴',
          series: 'Super Mario',
          dlc: false,
        },
      }),
      prisma.character.create({
        data: {
          name: 'Fox',
          slug: 'fox',
          icon: '🦊',
          series: 'Star Fox',
          dlc: false,
        },
      }),
      prisma.character.create({
        data: {
          name: 'Pikachu',
          slug: 'pikachu',
          icon: '⚡',
          series: 'Pokemon',
          dlc: false,
        },
      }),
      prisma.character.create({
        data: {
          name: 'Cloud',
          slug: 'cloud',
          icon: '⚔️',
          series: 'Final Fantasy',
          dlc: false,
        },
      }),
      prisma.character.create({
        data: {
          name: 'Link',
          slug: 'link',
          icon: '🗡️',
          series: 'The Legend of Zelda',
          dlc: false,
        },
      }),
    ]);

    // 3. Crear skins para cada personaje (8 skins por personaje)
    const skins = [];
    for (const character of characters) {
      for (let i = 1; i <= 8; i++) {
        skins.push(
          prisma.characterSkin.create({
            data: {
              characterId: character.id,
              name: `Skin ${i}`,
              number: i,
              image: `/characters/${character.slug}/skin${i}.png`,
            },
          })
        );
      }
    }
    await Promise.all(skins);

    // 4. Asignar personajes principales a usuarios
    await Promise.all([
      prisma.userCharacter.create({
        data: {
          userId: users[1].id, // MarioMain
          characterId: characters[0].id, // Mario
          skinId: (await prisma.characterSkin.findFirst({
            where: { characterId: characters[0].id, number: 1 },
          }))!.id,
          isPrimary: true,
        },
      }),
      prisma.userCharacter.create({
        data: {
          userId: users[2].id, // FoxPlayer
          characterId: characters[1].id, // Fox
          skinId: (await prisma.characterSkin.findFirst({
            where: { characterId: characters[1].id, number: 1 },
          }))!.id,
          isPrimary: true,
        },
      }),
      prisma.userCharacter.create({
        data: {
          userId: users[3].id, // PikachuKing
          characterId: characters[2].id, // Pikachu
          skinId: (await prisma.characterSkin.findFirst({
            where: { characterId: characters[2].id, number: 1 },
          }))!.id,
          isPrimary: true,
        },
      }),
      prisma.userCharacter.create({
        data: {
          userId: users[4].id, // CloudStriker
          characterId: characters[3].id, // Cloud
          skinId: (await prisma.characterSkin.findFirst({
            where: { characterId: characters[3].id, number: 1 },
          }))!.id,
          isPrimary: true,
        },
      }),
    ]);

    // 5. Crear torneos de prueba
    const tournament1 = await prisma.tournament.create({
      data: {
        name: 'SmashRank Argentina - Torneo Nacional #1',
        slug: 'smashrank-argentina-torneo-nacional-1',
        description: 'Primer torneo oficial de SmashRank Argentina. ¡Todos los jugadores del país están invitados!',
        province: 'Online',
        isOnline: true,
        format: 'DOUBLE_ELIMINATION',
        status: 'REGISTRATION_OPEN',
        maxParticipants: 64,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
        registrationStart: new Date(),
        registrationEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // En 5 días
        checkinStart: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        checkinEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rules: 'Reglas estándar competitivas: 3 stocks, 7 minutos, stage list legal.',
        stageList: 'Battlefield, Final Destination, Small Battlefield, Pokemon Stadium 2',
        createdById: users[0].id, // Admin
      },
    });

    const tournament2 = await prisma.tournament.create({
      data: {
        name: 'Weekly Smash Online - Edición #5',
        slug: 'weekly-smash-online-edicion-5',
        description: 'Torneo semanal casual. Perfecto para practicar y conocer jugadores nuevos.',
        province: 'Online',
        isOnline: true,
        format: 'SINGLE_ELIMINATION',
        status: 'REGISTRATION_OPEN',
        maxParticipants: 32,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        registrationStart: new Date(),
        registrationEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        checkinStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000),
        checkinEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        rules: 'Torneo casual: 3 stocks, sin restricciones de personajes.',
        stageList: 'Battlefield, Final Destination, Smashville',
        createdById: users[0].id,
      },
    });

    const userCount = await prisma.user.count();
    const characterCount = await prisma.character.count();
    const skinCount = await prisma.characterSkin.count();
    const tournamentCount = await prisma.tournament.count();

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente',
      data: {
        users: userCount,
        characters: characterCount,
        skins: skinCount,
        tournaments: tournamentCount,
      },
      testAccounts: {
        admin: {
          email: 'admin@smashrank.ar',
          password: 'admin123',
          role: 'ADMIN',
        },
        users: [
          { email: 'user1@smashrank.ar', password: 'user123', username: 'MarioMain' },
          { email: 'user2@smashrank.ar', password: 'user123', username: 'FoxPlayer' },
          { email: 'user3@smashrank.ar', password: 'user123', username: 'PikachuKing' },
          { email: 'user4@smashrank.ar', password: 'user123', username: 'CloudStriker' },
        ],
      },
    });
  } catch (error: any) {
    console.error('Error al inicializar base de datos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al inicializar base de datos',
        details: error.message,
        hint: 'Asegúrate de que la base de datos esté accesible y que las tablas estén creadas con prisma db push',
      },
      { status: 500 }
    );
  }
}
