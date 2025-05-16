// Import directly from generated client
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function checkWine() {
  try {
    // Check if the wine exists
    const wine = await prisma.wine.findUnique({
      where: {
        id: '12f6753c-736c-414d-8832-433d550f9187'
      },
      include: {
        winery: true
      }
    });

    console.log('Wine found:', !!wine);
    
    if (wine) {
      console.log('Wine details:', {
        id: wine.id,
        name: wine.name,
        wineryId: wine.wineryId,
        wineryName: wine.winery.name,
        winerySlug: wine.winery.slug
      });
      
      // Check if slug matches
      const slugMatches = wine.winery.slug === 'ondrej-zaplatilek';
      console.log('Slug matches:', slugMatches);
    }
  } catch (error) {
    console.error('Error checking wine:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWine();