// Import directly from generated client
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function testDbConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to count the wineries
    const wineriesCount = await prisma.winery.count();
    console.log(`Database connection successful. Found ${wineriesCount} wineries.`);
    
    // List all wineries with their slugs
    const wineries = await prisma.winery.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            wines: true
          }
        }
      }
    });
    
    console.log('Wineries in database:');
    wineries.forEach(winery => {
      console.log(`- ${winery.name} (slug: ${winery.slug}) - ${winery._count.wines} wines`);
    });
    
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDbConnection();