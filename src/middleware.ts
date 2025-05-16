import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Just pass through all requests - we're handling auth on the client side
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Keep the matcher to ensure this middleware gets registered
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/wines/:path*',
    '/api/qrcodes/:path*',
  ],
};