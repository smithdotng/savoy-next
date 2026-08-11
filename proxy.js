import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth-edge';

const PROTECTED_PAGE_PREFIXES = ['/menu'];
const PROTECTED_API_PREFIXES = [
  '/api/add-item',
  '/api/delete-item',
  '/api/manage-items',
  '/api/process-prices',
  '/api/upload-prices'
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/menu/:path*', '/api/add-item/:path*', '/api/delete-item/:path*', '/api/manage-items/:path*', '/api/process-prices/:path*', '/api/upload-prices/:path*']
};
