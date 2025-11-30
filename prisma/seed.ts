import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Lista completa de personajes de Super Smash Bros Ultimate
const characters = [
  // Original 12
  { name: 'Mario', slug: 'mario', series: 'Super Mario', dlc: false, skins: 8 },
  { name: 'Donkey Kong', slug: 'donkey-kong', series: 'Donkey Kong', dlc: false, skins: 8 },
  { name: 'Link', slug: 'link', series: 'The Legend of Zelda', dlc: false, skins: 8 },
  { name: 'Samus', slug: 'samus', series: 'Metroid', dlc: false, skins: 8 },
  { name: 'Dark Samus', slug: 'dark-samus', series: 'Metroid', dlc: false, skins: 8 },
  { name: 'Yoshi', slug: 'yoshi', series: 'Yoshi', dlc: false, skins: 8 },
  { name: 'Kirby', slug: 'kirby', series: 'Kirby', dlc: false, skins: 8 },
  { name: 'Fox', slug: 'fox', series: 'Star Fox', dlc: false, skins: 8 },
  { name: 'Pikachu', slug: 'pikachu', series: 'Pokémon', dlc: false, skins: 8 },
  { name: 'Luigi', slug: 'luigi', series: 'Super Mario', dlc: false, skins: 8 },
  { name: 'Ness', slug: 'ness', series: 'EarthBound', dlc: false, skins: 8 },
  { name: 'Captain Falcon', slug: 'captain-falcon', series: 'F-Zero', dlc: false, skins: 8 },
  { name: 'Jigglypuff', slug: 'jigglypuff', series: 'Pokémon', dlc: false, skins: 8 },
  { name: 'Peach', slug: 'peach', series: 'Super Mario', dlc: false, skins: 8 },
  { name: 'Daisy', slug: 'daisy', series: 'Super Mario', dlc: false, skins: 8 },
  { name: 'Bowser', slug: 'bowser', series: 'Super Mario', dlc: false, skins: 8 },
  { name: 'Ice Climbers', slug: 'ice-climbers', series: 'Ice Climber', dlc: false, skins: 8 },
  { name: 'Sheik', slug: 'sheik', series: 'The Legend of Zelda', dlc: false, skins: 8 },
  { name: 'Zelda', slug: 'zelda', series: 'The Legend of Zelda', dlc: false, skins: 8 },
  { name: 'Dr. Mario', slug: 'dr-mario', series: 'Super Mario', dlc: false, skins: 8 },
  { name: 'Pichu', slug: 'pichu', series: 'Pokémon', dlc: false, skins: 8 },
  { name: 'Falco', slug: 'falco', series: 'Star Fox', dlc: false, skins: 8 },
  { name: 'Marth', slug: 'marth', series: 'Fire Emblem', dlc: false, skins: 8 },
  { name: 'Lucina', slug: 'lucina', series: 'Fire Emblem', dlc: false, skins: 8 },
  { name: 'Young Link', slug: 'young-link', series: 'The Legend of Zelda', dlc: false, skins: 8 },
  { name: 'Ganondorf', slug: 'ganondorf', series: 'The Legend of Zelda', dlc: false, skins: 8 },
  { name: 'Mewtwo', slug: 'mewtwo', series: 'Pokémon', dlc: false, skins: 8 },
  { name: 'Roy', slug: 'roy', series: 'Fire Emblem', dlc: false, skins: 8 },
  { name: 'Chrom', slug: 'chrom', series: 'Fire Emblem', dlc: false, skins: 8 },
  { name: 'Mr. Game & Watch', slug: 'mr-game-and-watch', series: 'Game & Watch', dlc: false, skins: 8 },
  { name: 'Meta Knight', slug: 'meta-knight', series: 'Kirby', dlc: false, skins: 8 },
  { name: 'Pit', slug: 'pit', series: 'Kid Icarus', dlc: false, skins: 8 },
  { name: 'Dark Pit', slug: 'dark-pit', series: 'Kid Icarus', dlc: false, skins: 8 },
  { name: 'Zero Suit Samus', slug: 'zero-suit-samus', series: 'Metroid', dlc: false, skins: 8 },
  { name: 'Wario', slug: 'wario', series: 'Wario', dlc: false, skins: 8 },
  { name: 'Snake', slug: 'snake', series: 'Metal Gear', dlc: false, skins: 8 },
  { name: 'Ike', slug: 'ike', series: 'Fire Emblem', dlc: false, skins: 8 },
  { name: 'Pokémon Trainer', slug: 'pokemon-trainer', series: 'Pokémon', dlc: false, skins: 8 },
  { name: 'Diddy Kong', slug: 'diddy-kong', series: 'Donkey Kong', dlc: false, skins: 8 },
  { name: 'Lucas', slug: 'lucas', series: 'EarthBound', dlc: false, skins: 8 },
  { name: 'Sonic', slug: 'sonic', series: 'Sonic The Hedgehog', dlc: false, skins: 8 },
  { name: 'King Dedede', slug: 'king-dedede', series: 'Kirby', dlc: false, skins: 8 },
  { name: 'Olimar', slug: 'olimar', series: 'Pikmin', dlc: false, skins: 8 },
  { name: 'Lucario', slug: 'lucario', series: 'Pokémon', dlc: false, skins: 8 },
  { name: 'R.O.B.', slug: 'rob', series: 'R.O.B.', dlc: false, skins: 8 },
  { name: 'Toon Link', slug: 'toon-link', series: 'The Legend of Zelda', dlc: false, skins: 8 },
  { name: 'Wolf', slug: 'wolf', series: 'Star Fox', dlc: false, skins: 8 },
  { name: 'Villager', slug: 'villager', series: 'Animal Crossing', dlc: false, skins: 8 },
  { name: 'Mega Man', slug: 'mega-man', series: 'Mega Man', dlc: false, skins: 8 },
  { name: 'Wii Fit Trainer', slug: 'wii-fit-trainer', series: 'Wii Fit', dlc: false, skins: 8 },
  { name: 'Rosalina & Luma', slug: 'rosalina-and-luma', series: 'Super Mario', dlc: false, skins: 8 },
  { name: 'Little Mac', slug: 'little-mac', series: 'Punch-Out!!', dlc: false, skins: 8 },
  { name: 'Greninja', slug: 'greninja', series: 'Pokémon', dlc: false, skins: 8 },
  { name: 'Mii Brawler', slug: 'mii-brawler', series: 'Mii', dlc: false, skins: 8 },
  { name: 'Mii Swordfighter', slug: 'mii-swordfighter', series: 'Mii', dlc: false, skins: 8 },
  { name: 'Mii Gunner', slug: 'mii-gunner', series: 'Mii', dlc: false, skins: 8 },
  { name: 'Palutena', slug: 'palutena', series: 'Kid Icarus', dlc: false, skins: 8 },
  { name: 'Pac-Man', slug: 'pac-man', series: 'Pac-Man', dlc: false, skins: 8 },
  { name: 'Robin', slug: 'robin', series: 'Fire Emblem', dlc: false, skins: 8 },
  { name: 'Shulk', slug: 'shulk', series: 'Xenoblade Chronicles', dlc: false, skins: 8 },
  { name: 'Bowser Jr.', slug: 'bowser-jr', series: 'Super Mario', dlc: false, skins: 8 },
  { name: 'Duck Hunt', slug: 'duck-hunt', series: 'Duck Hunt', dlc: false, skins: 8 },
  { name: 'Ryu', slug: 'ryu', series: 'Street Fighter', dlc: false, skins: 8 },
  { name: 'Ken', slug: 'ken', series: 'Street Fighter', dlc: false, skins: 8 },
  { name: 'Cloud', slug: 'cloud', series: 'Final Fantasy', dlc: false, skins: 8 },
  { name: 'Corrin', slug: 'corrin', series: 'Fire Emblem', dlc: false, skins: 8 },
  { name: 'Bayonetta', slug: 'bayonetta', series: 'Bayonetta', dlc: false, skins: 8 },
  { name: 'Inkling', slug: 'inkling', series: 'Splatoon', dlc: false, skins: 8 },
  { name: 'Ridley', slug: 'ridley', series: 'Metroid', dlc: false, skins: 8 },
  { name: 'Simon', slug: 'simon', series: 'Castlevania', dlc: false, skins: 8 },
  { name: 'Richter', slug: 'richter', series: 'Castlevania', dlc: false, skins: 8 },
  { name: 'King K. Rool', slug: 'king-k-rool', series: 'Donkey Kong', dlc: false, skins: 8 },
  { name: 'Isabelle', slug: 'isabelle', series: 'Animal Crossing', dlc: false, skins: 8 },
  { name: 'Incineroar', slug: 'incineroar', series: 'Pokémon', dlc: false, skins: 8 },
  
  // DLC Fighters Pass 1
  { name: 'Piranha Plant', slug: 'piranha-plant', series: 'Super Mario', dlc: true, skins: 8 },
  { name: 'Joker', slug: 'joker', series: 'Persona', dlc: true, skins: 8 },
  { name: 'Hero', slug: 'hero', series: 'Dragon Quest', dlc: true, skins: 8 },
  { name: 'Banjo & Kazooie', slug: 'banjo-and-kazooie', series: 'Banjo-Kazooie', dlc: true, skins: 8 },
  { name: 'Terry', slug: 'terry', series: 'Fatal Fury', dlc: true, skins: 8 },
  { name: 'Byleth', slug: 'byleth', series: 'Fire Emblem', dlc: true, skins: 8 },
  
  // DLC Fighters Pass 2
  { name: 'Min Min', slug: 'min-min', series: 'ARMS', dlc: true, skins: 8 },
  { name: 'Steve', slug: 'steve', series: 'Minecraft', dlc: true, skins: 8 },
  { name: 'Sephiroth', slug: 'sephiroth', series: 'Final Fantasy', dlc: true, skins: 8 },
  { name: 'Pyra', slug: 'pyra', series: 'Xenoblade Chronicles', dlc: true, skins: 8 },
  { name: 'Mythra', slug: 'mythra', series: 'Xenoblade Chronicles', dlc: true, skins: 8 },
  { name: 'Kazuya', slug: 'kazuya', series: 'Tekken', dlc: true, skins: 8 },
  { name: 'Sora', slug: 'sora', series: 'Kingdom Hearts', dlc: true, skins: 8 },
];

// Provincias de Argentina
const provinces = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán'
];

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar base de datos
  await prisma.ranking.deleteMany();
  await prisma.match.deleteMany();
  await prisma.bracket.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.userCharacter.deleteMany();
  await prisma.characterSkin.deleteMany();
  await prisma.character.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Base de datos limpiada');

  // Crear personajes con sus skins
  console.log('🎮 Creando personajes...');
  for (const char of characters) {
    const character = await prisma.character.create({
      data: {
        name: char.name,
        slug: char.slug,
        series: char.series,
        dlc: char.dlc,
        icon: `/characters/${char.slug}.png`,
      },
    });

    // Crear skins para cada personaje
    for (let i = 1; i <= char.skins; i++) {
      await prisma.characterSkin.create({
        data: {
          characterId: character.id,
          name: `${char.name} - Skin ${i}`,
          number: i,
          image: `/characters/${char.slug}/skin-${i}.png`,
        },
      });
    }
  }

  console.log(`✅ ${characters.length} personajes creados con sus skins`);

  // Crear usuario admin
  console.log('👤 Creando usuarios de ejemplo...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@smashrank.ar',
      username: 'AdminSmash',
      password: hashedPassword,
      role: 'ADMIN',
      province: 'CABA',
      bio: 'Administrador de SmashRank Argentina',
    },
  });

  // Crear algunos usuarios de prueba
  const testUsers = [];
  const testProvinces = ['CABA', 'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza'];
  
  for (let i = 1; i <= 10; i++) {
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.create({
      data: {
        email: `user${i}@smashrank.ar`,
        username: `Player${i}`,
        password: userPassword,
        role: 'USER',
        province: testProvinces[i % testProvinces.length],
        bio: `Jugador de Smash desde 2018`,
      },
    });
    testUsers.push(user);
  }

  console.log(`✅ ${testUsers.length + 1} usuarios creados`);

  // Asignar personajes principales a usuarios
  console.log('🎯 Asignando personajes principales a usuarios...');
  const allCharacters = await prisma.character.findMany({
    include: { skins: true },
  });

  for (const user of [admin, ...testUsers]) {
    const randomChars = allCharacters
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    for (let i = 0; i < randomChars.length; i++) {
      const char = randomChars[i];
      const randomSkin = char.skins[Math.floor(Math.random() * char.skins.length)];
      
      await prisma.userCharacter.create({
        data: {
          userId: user.id,
          characterId: char.id,
          skinId: randomSkin.id,
          isPrimary: i === 0,
        },
      });
    }
  }

  console.log('✅ Personajes principales asignados');

  // Crear un torneo de ejemplo
  console.log('🏆 Creando torneo de ejemplo...');
  const now = new Date();
  const tournament = await prisma.tournament.create({
    data: {
      name: 'SmashRank Argentina - Torneo Inaugural',
      slug: 'smashrank-argentina-inaugural',
      description: 'El primer torneo oficial de SmashRank Argentina. ¡Únete y demuestra tu habilidad!',
      province: 'CABA',
      isOnline: false,
      format: 'DOUBLE_ELIMINATION',
      status: 'REGISTRATION_OPEN',
      maxParticipants: 32,
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 días después
      registrationStart: now,
      registrationEnd: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 días después
      checkinStart: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), // 6 días + 22 horas
      checkinEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 días después
      rules: 'Torneo de 3 stocks, 7 minutos, sin items. Stage list oficial de la comunidad.',
      stageList: 'Battlefield, Final Destination, Smashville, Town & City, Pokémon Stadium 2',
      ruleset: {
        stocks: 3,
        time: 7,
        items: false,
        stages: ['Battlefield', 'Final Destination', 'Smashville', 'Town & City', 'Pokémon Stadium 2'],
      },
      createdById: admin.id,
    },
  });

  console.log('✅ Torneo de ejemplo creado');

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📝 Credenciales de administrador:');
  console.log('   Email: admin@smashrank.ar');
  console.log('   Contraseña: admin123');
  console.log('\n📝 Credenciales de usuario de prueba:');
  console.log('   Email: user1@smashrank.ar (hasta user10@smashrank.ar)');
  console.log('   Contraseña: user123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
