// Import directly from generated client
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function getWineData(winerySlug, wineId) {
  try {
    console.log(`Fetching wine with ID ${wineId} for winery ${winerySlug}`);
    
    const wine = await prisma.wine.findUnique({
      where: {
        id: wineId,
      },
      include: {
        winery: true,
      },
    });

    console.log('Wine found in DB:', !!wine);
    
    if (!wine) {
      console.log('No wine found with ID:', wineId);
      return null;
    }
    
    console.log('Wine winery slug:', wine.winery.slug);
    console.log('Requested winery slug:', winerySlug);
    
    // Check if wine belongs to winery
    if (wine.winery.slug !== winerySlug) {
      console.log('Wine belongs to a different winery');
      return null;
    }

    console.log('Wine data successfully returned');
    return wine;
  } catch (error) {
    console.error('Error fetching wine data:', error);
    return null;
  }
}

async function debugRoute() {
  try {
    const winerySlug = 'ondrej-zaplatilek';
    const wineId = '12f6753c-736c-414d-8832-433d550f9187';
    
    const wine = await getWineData(winerySlug, wineId);
    console.log('Wine found by route handler:', !!wine);
    
    if (wine) {
      console.log('Wine details from route handler:', {
        id: wine.id,
        name: wine.name,
        wineryName: wine.winery.name
      });
    }
  } catch (error) {
    console.error('Error in debug route:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRoute();