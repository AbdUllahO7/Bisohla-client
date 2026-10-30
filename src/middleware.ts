import { NextRequest, NextResponse } from 'next/server';
import { Locale, routing } from './i18n/routing';
import createIntlMiddleware from 'next-intl/middleware';
import { refreshSessionIfNeeded } from './core/lib/web/session.refresh';
import {
  getSessionFromRequest,
  SESSION_COOKIE_OPTIONS,
  SESSION_KEY,
} from './core/lib/web/session.token';
import { allRoutes } from './constants/routes.constant';
import { getAdminRole, getUserRole } from './services/permission.service';

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Early return for .well-known paths (universal links)
  if (pathname.startsWith('/.well-known')) {
    return NextResponse.next();
  }

  // Early return for static files, manifest, favicon, robots, sitemap, service worker, assets, etc.
  if (
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/sitemap') ||
    pathname === '/sw.js' ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|json|xml|txt|webmanifest|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next();
  }

  // Early return for the /app store-redirect link so next-intl does not
  // localize it (`/app` → `/ar/app`); the route handler owns the response.
  if (
    pathname === '/app' ||
    pathname.startsWith('/app/')
  ) {
    return NextResponse.next();
  }

  // Apply intl middleware to handle localization
  const response = await intlMiddleware(req);

  // Renew the backend tokens here, where cookies are still writable — a Server
  // Component render cannot write them, so this is the only place a page load
  // can heal an expired access token. Also the point where a refresh token the
  // backend has rejected turns into an actual sign-out.
  //
  // Real navigations only:
  // - a Server Action arrives as a POST to the current URL, and the redirect
  //   below would discard it. Those run where cookies ARE writable, so
  //   `makeRequest` refreshes them itself.
  // - a `<Link>` prefetch is a GET the user never asked for, and several fire at
  //   once. Rotating credentials from one is the same trap that once had
  //   prefetch executing the sign-out route.
  const isPrefetch =
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('purpose') === 'prefetch' ||
    req.headers.get('x-purpose') === 'prefetch';

  const refresh =
    (req.method === 'GET' || req.method === 'HEAD') && !isPrefetch
      ? await refreshSessionIfNeeded(req)
      : ({ status: 'untouched', session: null } as const);

  if (refresh.status === 'refreshed') {
    // Redirect rather than continue: the render for THIS request has already
    // been handed the old cookie, and nothing downstream would see the new one.
    // Costs one round trip per access-token lifetime, and the next request
    // carries a live token so this cannot loop.
    const renewed = NextResponse.redirect(req.nextUrl);
    renewed.cookies.set(SESSION_KEY, refresh.cookie.token, {
      ...SESSION_COOKIE_OPTIONS,
      expires: new Date(refresh.cookie.expiresAt * 1000),
    });
    return renewed;
  }

  // Validated locally, without a network call, from the cookie the request
  // arrived with.
  const session =
    refresh.status === 'expired' ? null : await getSessionFromRequest(req);
  const hasSessionCookie = req.cookies.has('session');

  // If cookie exists but verification failed — or the backend just rejected the
  // refresh token — clear it on the response.
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
        const signInUrl = new URL(
          `${allRoutes.auth.children.signIn.path}`,
          req.nextUrl.origin,
        );
        const currentPath = req.nextUrl.pathname + req.nextUrl.search;
        if (currentPath && currentPath !== '/') {
          signInUrl.searchParams.set('redirect', currentPath);
        }
        return NextResponse.redirect(signInUrl);
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
    '/((?!api|_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|.*\\..*).*)',
  ],
};
