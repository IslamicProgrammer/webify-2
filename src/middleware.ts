import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { middleware as paraglide } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { method } = request;

  // CORS for /api/* routes
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers
      });
    }

    return response;
  }

  // i18n middleware for other routes
  return paraglide(request);
}

export const config = {
  matcher: [
    // Match everything except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
