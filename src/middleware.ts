import { NextRequest, NextResponse } from 'next/server';
import { allRoutes } from './constants/routes.constant';
import { getAdminRole, getUserRole } from './services/permission.service';
import { checkRole } from './lib/permission';

export default async function middleware(req: NextRequest) {
  // check auth pages
  if (req.nextUrl.pathname.startsWith('/auth')) {
    // if (session && session.user) {
    //   return NextResponse.redirect(
    //     new URL(allRoutes.profile.path, req.nextUrl),
    //   );
    // }
    return NextResponse.next();
  }

  // check admin pages
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (req.nextUrl.pathname.startsWith('/admin/auth')) {
      return NextResponse.next();
    }

    const isAdmin = await checkRole(getAdminRole()?.name || 'admin');
    if (!isAdmin) {
      return NextResponse.redirect(new URL(allRoutes.home.path, req.nextUrl));
    }
    return NextResponse.next();
  }

  // check session for profiel pages
  const isUser = await checkRole(getUserRole()?.name || 'user');

  if (!isUser) {
    return NextResponse.redirect(new URL(allRoutes.home.path, req.nextUrl));
  }

  NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/auth/:path*'],
};
