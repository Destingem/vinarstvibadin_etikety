import { PrismaClient } from '@/generated/prisma';

// Global variable to hold the Prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma instance
const prisma = global.prisma || new PrismaClient({
  log: ['error'],
});

// Save the prisma instance in development to avoid multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;