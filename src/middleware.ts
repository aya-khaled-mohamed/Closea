import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Portal routes
  if (pathname.startsWith('/admin')) {
    // Allow admin login page and static assets
    if (pathname === '/admin/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    const adminSession = request.cookies.get('closea_admin_session')?.value || request.cookies.get('closea_session')?.value;

    if (!adminSession) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
