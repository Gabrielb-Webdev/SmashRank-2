import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stages = [
  // Starter Stages (Game 1)
  {
    name: 'Battlefield',
    slug: 'battlefield',
    image: '/stages/battlefield.jpg',
    legal: true,
    starter: true,
    counterpick: false,
    order: 1,
  },
  {
    name: 'Final Destination',
    slug: 'final-destination',
    image: '/stages/final-destination.jpg',
    legal: true,
    starter: true,
    counterpick: false,
    order: 2,
  },
  {
    name: 'Pokémon Stadium 2',
    slug: 'pokemon-stadium-2',
    image: '/stages/pokemon-stadium-2.jpg',
    legal: true,
    starter: true,
    counterpick: false,
    order: 3,
  },
  {
    name: 'Smashville',
    slug: 'smashville',
    image: '/stages/smashville.jpg',
    legal: true,
    starter: true,
    counterpick: false,
    order: 4,
  },
  {
    name: "Town & City",
    slug: 'town-and-city',
    image: '/stages/town-and-city.jpg',
    legal: true,
    starter: true,
    counterpick: false,
    order: 5,
  },
  // Counterpick Stages (Game 2+)
  {
    name: 'Small Battlefield',
    slug: 'small-battlefield',
    image: '/stages/small-battlefield.jpg',
    legal: true,
    starter: false,
    counterpick: true,
    order: 6,
  },
  {
    name: 'Hollow Bastion',
    slug: 'hollow-bastion',
    image: '/stages/hollow-bastion.jpg',
    legal: true,
    starter: false,
    counterpick: true,
    order: 7,
  },
  {
    name: 'Kalos Pokémon League',
    slug: 'kalos-pokemon-league',
    image: '/stages/kalos-pokemon-league.jpg',
    legal: true,
    starter: false,
    counterpick: true,
    order: 8,
  },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const results = [];

    for (const stage of stages) {
      const result = await prisma.stage.upsert({
        where: { slug: stage.slug },
        update: stage,
        create: stage,
      });
      results.push(result.name);
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} stages creados/actualizados`,
      stages: results,
    });

  } catch (error: any) {
    console.error('Error seeding stages:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear stages',
        details: [error.message || String(error)],
      },
      { status: 500 }
    );
  }
}
