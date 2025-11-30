import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');
    const characterId = searchParams.get('characterId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construir query base
    const whereConditions: any = {};
    
    if (province && province !== 'all') {
      whereConditions.province = province;
    }

    // Obtener usuarios con sus estadísticas
    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        registrations: {
          include: {
            tournament: true,
            character: true,
          },
        },
        matchesWon: {
          include: {
            tournament: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            matchesWon: true,
          },
        },
      },
      take: limit,
    });

    // Calcular puntos y estadísticas para cada usuario
    const rankings = users.map((user) => {
      const tournaments = user.registrations.length;
      const wins = user.matchesWon.length;

      // Calcular puntos (sistema: 100 por victoria + 10 por participación en torneo)
      const points = (wins * 100) + (tournaments * 10);

      // Personaje más usado
      const characterCounts: Record<string, number> = {};
      user.registrations.forEach((reg) => {
        if (reg.character) {
          characterCounts[reg.character.name] = (characterCounts[reg.character.name] || 0) + 1;
        }
      });
      
      const mainCharacter = Object.entries(characterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      return {
        userId: user.id,
        username: user.username,
        province: user.province,
        avatar: user.avatar,
        points,
        tournaments,
        wins,
        mainCharacter,
      };
    });

    // Filtrar por personaje si se especifica
    let filteredRankings = rankings;
    if (characterId) {
      filteredRankings = rankings.filter((r) => {
        const userChar = users.find(u => u.id === r.userId)?.registrations.find(reg => reg.characterId === characterId);
        return !!userChar;
      });
    }

    // Ordenar por puntos
    const sortedRankings = filteredRankings.sort((a, b) => b.points - a.points);

    // Asignar rankings
    const rankedUsers = sortedRankings.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json({ rankings: rankedUsers });
  } catch (error) {
    console.error('Error al obtener rankings:', error);
    return NextResponse.json(
      { error: 'Error al obtener los rankings' },
      { status: 500 }
    );
  }
}
