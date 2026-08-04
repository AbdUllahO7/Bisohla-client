import { NextRequest, NextResponse } from 'next/server';
import { Locale, routing } from './i18n/routing';
import createIntlMiddleware from 'next-intl/middleware';
import { getSession } from './core/lib/web/session';
import { allRoutes } from './constants/routes.constant';
import { getAdminRole, getUserRole } from './services/permission.service';

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

async function middleware(req: NextRequest) {
  // Early return for .well-known paths (universal links)
  if (req.nextUrl.pathname.startsWith('/.well-known')) {
    return NextResponse.next();
  }

  // Early return for the /app store-redirect link so next-intl does not
  // localize it (`/app` → `/ar/app`); the route handler owns the response.
  if (
    req.nextUrl.pathname === '/app' ||
    req.nextUrl.pathname.startsWith('/app/')
  ) {
    return NextResponse.next();
  }

  // Apply intl middleware first to handle localization
  const response = await intlMiddleware(req);

  // Early return for assets, api routes, etc.
  if (
    req.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/) ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api')
  ) {
    return response;
  }

  // Validate session locally without network calls
  const session = await getSession();
  const hasSessionCookie = req.cookies.has('session');

  // If cookie exists but verification failed, clear invalid cookie on response
  if (hasSessionCookie && !session) {
    response.cookies.set('session', '', { maxAge: 0, path: '/' });
  }

  const isValidSession = !!session?.user;

  // Extract locale from URL
  const pathParts = req.nextUrl.pathname.split('/').filter(Boolean);
  const locale = routing.locales.includes(pathParts[0] as Locale)
    ? pathParts[0]
    : routing.defaultLocale;
  const routeType = routing.locales.includes(pathParts[0] as Locale)
    ? pathParts[1]
    : pathParts[0];

  // Handle route-specific logic
  try {
    // Auth routes - redirect logged-in users away from sign-in/register
    if (routeType === 'auth') {
      if (isValidSession) {
        return NextResponse.redirect(
          new URL(`/userProfile`, req.nextUrl.origin),
        );
      }
      return response;
    }

    // Admin routes
    if (routeType === 'admin') {
      if (req.nextUrl.pathname.includes('/admin/auth')) {
        return response;
      }

      const adminRoleName = getAdminRole()?.name || 'admin';
      const isAdmin = isValidSession && (session?.user?.roles?.includes(adminRoleName) ?? false);

      if (!isAdmin) {
        return NextResponse.redirect(
          new URL(`${allRoutes.home.path}`, req.nextUrl.origin),
        );
      }

      return response;
    }

    // User routes
    if (routeType === 'userProfile' || routeType === 'car-alerts') {
      const userRoleName = getUserRole()?.name || 'user';
      const isUser =
        isValidSession &&
        ((session?.user?.roles?.includes(userRoleName) ?? false) ||
          (session?.user?.roles?.includes('admin') ?? false));

      if (!isUser) {
        return NextResponse.redirect(
          new URL(
            `${allRoutes.auth.children.signIn.path}`,
            req.nextUrl.origin,
          ),
        );
      }

      return response;
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(
      new URL(`${allRoutes.home.path}`, req.nextUrl.origin),
    );
  }
}

export default middleware;

// Configure middleware matcher with static values
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets/).*)',
  ],
};
