import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/session';
import { allRoutes } from './constants/routes.constant';

export default async function middleware(req: NextRequest) {
  const session = await getSession();

  if (
    req.nextUrl.pathname.startsWith('/register') ||
    req.nextUrl.pathname.startsWith('/sign-in') ||
    req.nextUrl.pathname.startsWith('/forgot-password')
  ) {
    if (session && session.user) {
      return NextResponse.redirect(
        new URL(allRoutes.profile.path, req.nextUrl),
      );
    }
    return NextResponse.next();
  }

  if (!session || !session.user) {
    return NextResponse.redirect(
      new URL(allRoutes.auth.children.signIn.path, req.nextUrl),
    );
  }

  NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/sign-in',
    '/register',
    '/forgot-password',
  ],
};
