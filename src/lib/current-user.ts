import { getAuthToken, verifyToken } from './auth-utils';
// Import directly from JS file
import prisma from './db';

// Helper function to get the current user
export async function getCurrentUser() {
  const token = await getAuthToken();
  
  if (!token) {
    return null;
  }
  
  const verifiedToken = verifyToken(token);
  
  if (!verifiedToken) {
    return null;
  }
  
  try {
    const user = await prisma.winery.findUnique({
      where: { id: verifiedToken.userId },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
      },
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}