import { createHash, randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

// This is a direct instance for the seed script, not using the shared client
const prisma = new PrismaClient();

// Simple password hashing function
function hashPassword(password: string): { hash: string, salt: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return { hash, salt };
}

async function main() {
  console.log('Starting seed...');

  // Create a test winery
  const { hash: hashedPassword, salt } = hashPassword('password123');
  
  const winery = await prisma.winery.upsert({
    where: { email: 'test@vinarstvi.cz' },
    update: {},
    create: {
      name: 'Testovací Vinařství',
      email: 'test@vinarstvi.cz',
      slug: 'testovaci-vinarstvi',
      passwordHash: hashedPassword,
      passwordSalt: salt,
      address: 'Testovací 123, Vinařov, 69001',
    },
  });
  
  console.log(`Created winery: ${winery.name}`);
  
  // Create test wines
  const wine1 = await prisma.wine.upsert({
    where: {
      id: 'test-wine-1',
    },
    update: {},
    create: {
      id: 'test-wine-1',
      name: 'Ryzlink rýnský',
      vintage: 2022,
      batch: 'RR-1/22',
      alcoholContent: 12.5,
      energyValueKJ: 310,
      energyValueKcal: 74,
      carbs: 3.7,
      sugars: 2.5,
      protein: 0.2,
      ingredients: 'Hrozny, antioxidant: oxid siřičitý',
      allergens: 'Obsahuje siřičitany',
      wineRegion: 'Morava',
      wineSubregion: 'Znojemská',
      wineVillage: 'Hnanice',
      wineTract: 'U kapličky',
      wineryId: winery.id,
    },
  });
  
  const wine2 = await prisma.wine.upsert({
    where: {
      id: 'test-wine-2',
    },
    update: {},
    create: {
      id: 'test-wine-2',
      name: 'Pálava',
      vintage: 2022,
      batch: 'PAL-2/22',
      alcoholContent: 13,
      energyValueKJ: 330,
      energyValueKcal: 79,
      carbs: 4.2,
      sugars: 3.5,
      protein: 0.2,
      ingredients: 'Hrozny, antioxidant: oxid siřičitý',
      allergens: 'Obsahuje siřičitany',
      wineRegion: 'Morava',
      wineSubregion: 'Mikulovská',
      wineVillage: 'Perná',
      wineTract: 'Pod Pálavou',
      wineryId: winery.id,
    },
  });
  
  console.log(`Created wines: ${wine1.name}, ${wine2.name}`);
  
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });