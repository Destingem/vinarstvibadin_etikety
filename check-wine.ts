import prisma from './src/lib/prisma';

async function checkWineOwnership() {
  const wineId = '12f6753c-736c-414d-8832-433d550f9187';
  const winerySlug = 'ondrej-zaplatilek';

  try {
    // Find the wine and include the winery relation
    const wine = await prisma.wine.findUnique({
      where: {
        id: wineId
      },
      include: {
        winery: true
      }
    });

    if (!wine) {
      console.log(`Wine with ID ${wineId} does not exist.`);
      return false;
    }

    if (wine.winery.slug !== winerySlug) {
      console.log(`Wine with ID ${wineId} exists but belongs to winery with slug '${wine.winery.slug}', not '${winerySlug}'.`);
      return false;
    }

    console.log(`Wine with ID ${wineId} exists and belongs to winery with slug '${winerySlug}'.`);
    return true;
  } catch (error) {
    console.error('Error checking wine ownership:', error);
    return false;
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Execute the function
checkWineOwnership()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });