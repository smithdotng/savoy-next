import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function GET(request) {
  clearSessionCookie();
  return NextResponse.redirect(new URL('/login', request.url));
}
