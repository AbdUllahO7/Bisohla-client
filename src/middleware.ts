import { NextRequest, NextResponse } from 'next/server';
import { Locale, routing } from './i18n/routing';
import createIntlMiddleware from 'next-intl/middleware';
import { getSession, deleteSession } from './core/lib/web/session';
import { checkAuth } from './core/infrastructure-adapters/actions/auth/auth.actions';
import { allRoutes } from './constants/routes.constant';
import { getAdminRole, getUserRole } from './services/permission.service';
import { checkRole } from './lib/permission';

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

// Session validation helper function
async function validateSession(): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session) return false;

    const res = await checkAuth();
    if (!res.success) {
      await deleteSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

async function middleware(req: NextRequest) {
  console.log('Middleware triggered');

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

  // Extract locale from URL (considering the intl middleware has processed it)
  const pathParts = req.nextUrl.pathname.split('/').filter(Boolean);
  const locale = routing.locales.includes(pathParts[0] as Locale)
    ? pathParts[0]
    : routing.defaultLocale;
  const routeType = routing.locales.includes(pathParts[0] as Locale)
    ? pathParts[1]
    : pathParts[0];

  // Validate user session
  const isValidSession = await validateSession();

  // Handle route-specific logic
  try {
    // Auth routes - redirect logged-in users
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
      // Allow access to admin auth pages
      if (req.nextUrl.pathname.includes('/admin/auth')) {
        return response;
      }

      // Check if user is admin
      try {
        const adminRoleName = getAdminRole()?.name || 'admin';
        const isAdmin = await checkRole(adminRoleName);

        if (!isAdmin) {
          return NextResponse.redirect(
            new URL(`${allRoutes.home.path}`, req.nextUrl.origin),
          );
        }

        return response;
      } catch (error) {
        console.error('Error checking admin role:', error);
        return NextResponse.redirect(
          new URL(`${allRoutes.home.path}`, req.nextUrl.origin),
        );
      }
    }

    // User routes
    if (routeType === 'user') {
      try {
        const userRoleName = getUserRole()?.name || 'user';
        const isUser = await checkRole(userRoleName);

        if (!isUser) {
          return NextResponse.redirect(
            new URL(`${allRoutes.home.path}`, req.nextUrl.origin),
          );
        }

        return response;
      } catch (error) {
        console.error('Error checking user role:', error);
        return NextResponse.redirect(
          new URL(`${allRoutes.home.path}`, req.nextUrl.origin),
        );
      }
    }

    // For all other routes, return the intl middleware response
    console.log('Returning intl middleware response');
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets/).*)',
  ],
};
