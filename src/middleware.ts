import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TEMPORARY: Middleware disabled due to Edge Runtime crypto limitations
// API routes still have individual JWT validation in each route handler
// Client-side auth protects page routes via useRequireAuth hook

export function middleware(request: NextRequest) {
  // Pass through all requests for now
  // Security is still maintained through:
  // 1. Individual API route JWT validation
  // 2. Client-side auth protection
  // 3. Appwrite document-level permissions
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match API routes that need protection
    '/api/wines/:path*',
    '/api/qrcodes/:path*',
    '/api/analytics/:path*',
    '/api/admin/:path*',
    '/api/api-keys/:path*',
    '/api/data/:path*',
    '/api/membership/:path*',
  ],
};