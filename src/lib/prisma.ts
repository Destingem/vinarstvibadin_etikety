import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance for the entire application
// Note: This is a singleton pattern and should be used carefully in Next.js
//       If you encounter issues, use the factory function from db.ts instead
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, we want to avoid creating multiple instances
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;