import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createJwtToken, getUserByIdStrict, verifyJwtToken } from '@/lib/auth-server';

export const SESSION_COOKIE_NAME = 'etiketa_session';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  slug?: string;
  isDemo?: boolean;
};

export function createSessionToken(userId: string) {
  return createJwtToken(userId, '7d');
}

export function applySessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
}

function extractBearerToken(value: string | null) {
  if (!value) {
    return null;
  }

  return value.startsWith('Bearer ') ? value.slice(7) : value;
}

export function getRequestSessionToken(request: Pick<NextRequest, 'headers' | 'cookies'>) {
  const headerToken = extractBearerToken(request.headers.get('Authorization'));

  if (headerToken) {
    return headerToken;
  }

  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getRequestSessionUser(request: Pick<NextRequest, 'headers' | 'cookies'>): Promise<SessionUser | null> {
  const token = getRequestSessionToken(request);

  if (!token) {
    return null;
  }

  let decoded: { userId: string };

  try {
    decoded = verifyJwtToken(token);
  } catch {
    return null;
  }

  const user = await getUserByIdStrict(decoded.userId);

  if (!user) {
    return null;
  }

  return {
    id: user.$id,
    name: user.name,
    email: user.email,
    slug: user.prefs?.slug,
    isDemo: user.email === 'demo@etiketa.wine',
  };
}

export async function getCookieSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  let decoded: { userId: string };

  try {
    decoded = verifyJwtToken(token);
  } catch {
    return null;
  }

  const user = await getUserByIdStrict(decoded.userId);

  if (!user) {
    return null;
  }

  return {
    id: user.$id,
    name: user.name,
    email: user.email,
    slug: user.prefs?.slug,
    isDemo: user.email === 'demo@etiketa.wine',
  };
}
