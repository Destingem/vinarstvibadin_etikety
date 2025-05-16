import { createHash, randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

/**
 * This script can be used to initialize the database with an admin user.
 * Run it after migrations have been applied.
 * 
 * Usage:
 * npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/setup.ts
 */

// This is a direct instance for the setup script, not using the shared client
const prisma = new PrismaClient();

// Simple password hashing function
function hashPassword(password: string): { hash: string, salt: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return { hash, salt };
}

// Configuration
const WINERY_NAME = 'Vinařství Admin';
const WINERY_EMAIL = 'admin@vinarstviqr.cz';
const WINERY_PASSWORD = 'Admin123456';  // Should be changed after first login

async function main() {
  console.log('Starting database initialization...');

  try {
    // Check if admin winery already exists
    const existingWinery = await prisma.winery.findUnique({
      where: { email: WINERY_EMAIL }
    });

    if (existingWinery) {
      console.log(`Winery with email ${WINERY_EMAIL} already exists. Skipping creation.`);
    } else {
      // Hash password
      const { hash: hashedPassword, salt } = hashPassword(WINERY_PASSWORD);
      
      // Create slug from winery name
      const slug = WINERY_NAME
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Create admin winery
      const winery = await prisma.winery.create({
        data: {
          name: WINERY_NAME,
          email: WINERY_EMAIL,
          slug,
          passwordHash: hashedPassword,
          passwordSalt: salt,
          address: 'Example Street 123, 12345 Winetown',
        },
      });
      
      console.log(`Created admin winery "${winery.name}" with email ${winery.email}`);
      console.log(`Please change the password after first login.`);
      
      // Create example wines
      const exampleWines = [
        {
          name: 'Ryzlink rýnský',
          vintage: 2023,
          batch: 'RR-01/23',
          alcoholContent: 12.5,
          energyValueKJ: 310,
          energyValueKcal: 74,
          fat: 0,
          saturatedFat: 0,
          carbs: 3.7,
          sugars: 2.5,
          protein: 0.2,
          salt: 0,
          ingredients: 'Hrozny, antioxidant: oxid siřičitý',
          allergens: 'Obsahuje siřičitany',
          wineRegion: 'Morava',
          wineSubregion: 'Mikulovská',
          wineVillage: 'Perná',
          wineTract: 'Pod Pálavou',
          wineryId: winery.id,
        },
        {
          name: 'Pálava výběr z hroznů',
          vintage: 2023,
          batch: 'PAL-02/23',
          alcoholContent: 13,
          energyValueKJ: 330,
          energyValueKcal: 79,
          fat: 0,
          saturatedFat: 0,
          carbs: 4.2,
          sugars: 3.5,
          protein: 0.2,
          salt: 0,
          ingredients: 'Hrozny, antioxidant: oxid siřičitý',
          allergens: 'Obsahuje siřičitany',
          wineRegion: 'Morava',
          wineSubregion: 'Mikulovská',
          wineVillage: 'Perná',
          wineTract: 'Pod Pálavou',
          wineryId: winery.id,
        },
      ];
      
      for (const wine of exampleWines) {
        await prisma.wine.create({ data: wine });
      }
      
      console.log(`Created ${exampleWines.length} example wines.`);
    }
    
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();