// Database connectivity test
// Run with: node prisma/check-db.js

// Direct import from generated client location
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

// Simple function to test connection
async function main() {
  try {
    console.log('Testing database connection...');
    
    // Try to get count of wineries (or any simple query)
    const count = await prisma.winery.count();
    
    console.log(`Connection successful! Found ${count} wineries in the database.`);
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
main()
  .then(result => {
    console.log(result ? 'Database check completed successfully.' : 'Database check failed.');
    process.exit(result ? 0 : 1);
  })
  .catch(e => {
    console.error('Unexpected error during database check:');
    console.error(e);
    process.exit(1);
  });