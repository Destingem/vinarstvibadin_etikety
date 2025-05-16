// Import PrismaClient directly from generated client
import { PrismaClient } from '@prisma/client';

// Create and export a singleton PrismaClient instance
const prisma = new PrismaClient();
export default prisma;