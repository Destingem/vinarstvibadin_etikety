// Import directly from generated client
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// Direct implementation of the route handler
async function getWineData(winerySlug, wineId) {
  try {
    console.log(`Fetching wine with ID ${wineId} for winery ${winerySlug}`);
    
    // First, try to find the wine directly
    const wine = await prisma.wine.findUnique({
      where: {
        id: wineId,
      },
      include: {
        winery: true,
      },
    });

    console.log(`Wine found in DB: ${!!wine}`);
    
    if (!wine) {
      console.log(`No wine found with ID: ${wineId}`);
      return null;
    }
    
    console.log(`Wine winery slug: ${wine.winery.slug}`);
    console.log(`Requested winery slug: ${winerySlug}`);
    console.log(`Wine ID type: ${typeof wineId}, Slug type: ${typeof winerySlug}`);
    console.log(`Param string equality check: ${wine.winery.slug === winerySlug}`);
    console.log(`Lowercase check: ${wine.winery.slug.toLowerCase() === winerySlug.toLowerCase()}`);
    
    // Output the exact characters for debugging
    console.log('Stored slug characters:', Array.from(wine.winery.slug).map(c => c.charCodeAt(0)));
    console.log('Requested slug characters:', Array.from(winerySlug).map(c => c.charCodeAt(0)));
    
    // Check if wine belongs to winery - case insensitive comparison
    const storedSlug = wine.winery.slug.toLowerCase();
    const requestedSlug = winerySlug.toLowerCase();
    
    if (storedSlug !== requestedSlug) {
      console.log(`Wine belongs to a different winery (case insensitive check)`);
      return null;
    }

    console.log(`Wine data successfully returned: ${wine.name}`);
    return wine;
  } catch (error) {
    console.error('Error fetching wine data:', error);
    return null;
  }
}

async function testRoute() {
  try {
    const winerySlug = 'ondrej-zaplatilek';
    const wineId = '12f6753c-736c-414d-8832-433d550f9187';
    
    console.log('Testing with:', { winerySlug, wineId });
    const wine = await getWineData(winerySlug, wineId);
    
    if (!wine) {
      console.log('Test FAILED: Wine not found');
    } else {
      console.log('Test PASSED: Wine found');
      console.log('Wine details:', {
        id: wine.id,
        name: wine.name,
        wineryName: wine.winery.name
      });
    }
    
    // Test with different case
    console.log('\nTesting with different case:');
    const upperCaseSlug = 'ONDREJ-ZAPLATILEK';
    const wineWithUpperCase = await getWineData(upperCaseSlug, wineId);
    
    if (!wineWithUpperCase) {
      console.log('Test with uppercase FAILED: Wine not found');
    } else {
      console.log('Test with uppercase PASSED: Wine found');
    }
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoute();