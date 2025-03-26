import { NextRequest, NextResponse } from 'next/server';
import { allRoutes } from './constants/routes.constant';
import { getAdminRole, getUserRole } from './services/permission.service';
import { checkRole } from './lib/permission';
import { Locale, routing } from './i18n/routing';
import createIntlMiddleware from 'next-intl/middleware';
import { deleteSession, getSession } from './core/lib/web/session';
import { checkAuth } from './core/infrastructure-adapters/actions/auth/auth.actions';

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

async function handleAuthRoutes(req: NextRequest) {
  console.log('🔐 handleAuthRoutes called! Path:', req.nextUrl.pathname);

  const session = await getSession();
  console.log('Session state:', session ? 'Session exists' : 'No session');

  if (session && session.user) {
    console.log('User is logged in, redirecting to profile');
    const locale = req.nextUrl.pathname.split('/')[1];
    return NextResponse.redirect(
      new URL(`/${locale}/userProfile`, req.nextUrl),
    );
  }

  console.log('Auth route check passed, allowing access');
  return null;
}

async function handleAdminRoutes(req: NextRequest) {
  console.log('👑 handleAdminRoutes called! Path:', req.nextUrl.pathname);

  const locale = req.nextUrl.pathname.split('/')[1];

  if (req.nextUrl.pathname.includes('/admin/auth')) {
    console.log('Admin auth page, allowing access');
    return null;
  }

  try {
    const adminRoleName = getAdminRole()?.name || 'admin';
    const isAdmin = await checkRole(adminRoleName);
    console.log('Admin check result:', isAdmin ? 'Is admin' : 'Not admin');

    if (!isAdmin) {
      console.log('Not an admin, redirecting to home');
      return NextResponse.redirect(
        new URL(`/${locale}${allRoutes.home.path}`, req.nextUrl),
      );
    }

    console.log('Admin check passed, allowing access');
    return null;
  } catch (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.redirect(
      new URL(`/${locale}${allRoutes.home.path}`, req.nextUrl),
    );
  }
}

async function handleUserRoutes(req: NextRequest) {
  console.log('👤 handleUserRoutes called! Path:', req.nextUrl.pathname);

  const locale = req.nextUrl.pathname.split('/')[1];

  try {
    const userRoleName = getUserRole()?.name || 'user';
    const isUser = await checkRole(userRoleName);
    console.log('User check result:', isUser ? 'Is user' : 'Not user');

    if (!isUser) {
      console.log('Not a user, redirecting to home');
      return NextResponse.redirect(
        new URL(`/${locale}${allRoutes.home.path}`, req.nextUrl),
      );
    }

    console.log('User check passed, allowing access');
    return null;
  } catch (error) {
    console.error('Error checking user role:', error);
    return NextResponse.redirect(
      new URL(`/${locale}${allRoutes.home.path}`, req.nextUrl),
    );
  }
}

async function handleCheckAuthUser() {
  const session = await getSession();
  if (session) {
    console.log('Checking existing session validity');
    const res = await checkAuth();
    if (!res.success) {
      console.log('Session invalid, deleting session');
      await deleteSession();
    } else {
      console.log('Session valid');
    }
  }
}

async function middleware(req: NextRequest) {
  console.log('⚙️ Middleware starting for path:', req.nextUrl.pathname);

  try {
    // Check auth first
    await handleCheckAuthUser();

    // Store original URL for debugging
    const originalUrl = req.nextUrl.clone();
    console.log('Original URL:', originalUrl.pathname);

    // Process the path to find what type of route it is
    // Handle both /auth/sign-in and /en/auth/sign-in patterns
    const pathParts = req.nextUrl.pathname.split('/').filter(Boolean);
    console.log('Path parts:', pathParts);

    // Determine if first part is a locale
    const firstPartIsLocale = routing.locales.includes(pathParts[0] as Locale);
    console.log('First part is locale:', firstPartIsLocale);

    // Extract route type (auth, admin, user)
    const routeType = firstPartIsLocale ? pathParts[1] : pathParts[0];
    console.log('Route type identified as:', routeType);

    // Execute specific route handler based on type
    let routeResponse = null;
    if (routeType === 'auth') {
      routeResponse = await handleAuthRoutes(req);
    } else if (routeType === 'admin') {
      routeResponse = await handleAdminRoutes(req);
    } else if (routeType === 'user') {
      routeResponse = await handleUserRoutes(req);
    }

    // Apply intl middleware after our route checks
    if (routeResponse) {
      console.log('Route handler returned redirect, using that');
      return routeResponse;
    }

    console.log('No redirect from route handler, applying i18n middleware');
    return await intlMiddleware(req);
  } catch (error) {
    console.error('Middleware error:', error);
    const locale = req.nextUrl.pathname.split('/')[1];
    if (routing.locales.includes(locale as Locale)) {
      return NextResponse.redirect(
        new URL(`/${locale}${allRoutes.home.path}`, req.nextUrl),
      );
    }
    return NextResponse.redirect(new URL(allRoutes.home.path, req.nextUrl));
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
