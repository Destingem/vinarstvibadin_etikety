import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthResponse } from '@/types';

// Browser-compatible simple hashing function using Web Crypto API
export async function hashPasswordAsync(password: string, salt?: string): Promise<{ hash: string, salt: string }> {
  // Use provided salt or create a new one
  const usedSalt = salt || Array.from(
    new Uint8Array(16)
  ).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Convert password + salt to Uint8Array
  const msgBuffer = new TextEncoder().encode(password + usedSalt);
  
  // Use Web Crypto API for hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { hash: hashHex, salt: usedSalt };
}

// For backward compatibility - synchronous version that works only on the server
export function hashPassword(password: string, salt?: string): { hash: string, salt: string } {
  // This is only used on the server - not in Edge runtime
  // Import crypto only when this function is called
  const crypto = require('crypto');
  
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256')
    .update(password + usedSalt)
    .digest('hex');
  
  return { hash, salt: usedSalt };
}

export function comparePasswords(
  password: string,
  storedHash: string,
  salt: string
): boolean {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
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
  try {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Get token from localStorage in the browser
      return localStorage.getItem('auth-token') || undefined;
    } else {
      // For server-side, check request headers
      // Note: This won't be used directly, as we're using middleware for auth checks
      return undefined;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
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