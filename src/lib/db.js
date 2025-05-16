// Use the singleton PrismaClient from prisma-client.ts
const prisma = require('./prisma-client').default;

// Export the client directly
module.exports = prisma;