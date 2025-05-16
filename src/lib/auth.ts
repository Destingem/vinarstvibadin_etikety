// This file is kept for reference but is not currently used.
// Appwrite authentication is used instead.
// The bcrypt dependency has been removed to fix build errors.

import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthResponse } from '@/types';
import prisma from './prisma';

// Password hashing functions that used bcrypt have been removed

export function generateToken(userId: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return sign({ userId }, jwtSecret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    return verify(token, jwtSecret) as { userId: string };
  } catch (error) {
    return null;
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  // In Next.js 15, cookies() might return a Promise, so we need to await it
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  
  if (!token) {
    return null;
  }
  
  const verifiedToken = verifyToken(token);
  
  if (!verifiedToken) {
    return null;
  }
  
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
}

export function createAuthResponse(userId: string, name: string, email: string): AuthResponse {
  const token = generateToken(userId);
  
  return {
    token,
    user: {
      id: userId,
      name,
      email,
    },
  };
}