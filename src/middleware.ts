import { NextRequest, NextResponse } from 'next/server';
import { allRoutes } from './constants/routes.constant';
import { getAdminRole, getUserRole } from './services/permission.service';
import { checkRole } from './lib/permission';
import { routing } from './i18n/routing';
import createIntlMiddleware from 'next-intl/middleware';

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

async function handleAuthRoutes(req: NextRequest) {
  // TODO: Implement session check when ready
  // if (session && session.user) {
  //   return NextResponse.redirect(new URL(allRoutes.profile.path, req.nextUrl));
  // }
  return NextResponse.next();
}

async function handleAdminRoutes(req: NextRequest) {
  // Allow access to admin auth pages
  if (req.nextUrl.pathname.startsWith('/admin/auth')) {
    return NextResponse.next();
  }

  try {
    const adminRoleName = getAdminRole()?.name || 'admin';
    const isAdmin = await checkRole(adminRoleName);

    if (!isAdmin) {
      return NextResponse.redirect(new URL(allRoutes.home.path, req.nextUrl));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.redirect(new URL(allRoutes.home.path, req.nextUrl));
  }
}

async function handleUserRoutes(req: NextRequest) {
  try {
    const userRoleName = getUserRole()?.name || 'user';
    const isUser = await checkRole(userRoleName);

    if (!isUser) {
      return NextResponse.redirect(new URL(allRoutes.home.path, req.nextUrl));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error checking user role:', error);
    return NextResponse.redirect(new URL(allRoutes.home.path, req.nextUrl));
  }
}

async function middleware(req: NextRequest) {
  try {
    // Apply internationalization middleware first
    const response = await intlMiddleware(req);
    if (response) return response;

    // Handle different route patterns
    if (req.nextUrl.pathname.startsWith('/auth')) {
      return handleAuthRoutes(req);
    }

    if (req.nextUrl.pathname.startsWith('/admin')) {
      return handleAdminRoutes(req);
    }

    if (req.nextUrl.pathname.startsWith('/user')) {
      return handleUserRoutes(req);
    }

    // Default behavior for unmatched routes
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
