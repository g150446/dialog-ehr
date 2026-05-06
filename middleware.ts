import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './lib/session';

// Authentication setting
const isAuthRequired = (): boolean => {
  return process.env.EHR_AUTH_REQUIRED === 'true';
};

// Public routes (always accessible)
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/reset-password'];

// Protected API routes
const PROTECTED_API_ROUTES = [
  '/api/patients',
  '/api/settings',
  '/api/users',
  '/api/ollama',
  '/api/groq',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes are always accessible
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  // If authentication is not required, inject default user headers for API routes
  // but do not redirect or block anything
  if (!isAuthRequired()) {
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', 'demo-admin');
      requestHeaders.set('x-user-role', 'DOCTOR');
      requestHeaders.set('x-user-is-admin', 'true');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    return response;
  }

  // Authentication required mode
  if (!session.isLoggedIn) {
    // Page routes: redirect to /login
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // API routes: return 401
    if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Authenticated: inject user headers for API routes
  if (pathname.startsWith('/api/') && session.isLoggedIn) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-user-role', session.role);
    requestHeaders.set('x-user-is-admin', session.isAdmin.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, other static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
