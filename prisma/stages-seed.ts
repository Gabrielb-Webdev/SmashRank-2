import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function seedStages() {
  console.log('🎭 Seeding stages...');

  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { slug: stage.slug },
      update: stage,
      create: stage,
    });
    console.log(`✅ ${stage.name}`);
  }

  console.log('✨ Stages seeded successfully!');
}

seedStages()
  .catch((e) => {
    console.error('Error seeding stages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
