import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthResponse } from '@/types';
import prisma from './prisma';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

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