import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  createSessionToken,
  verifySessionToken
} from './auth-edge';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(payload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', { ...sessionCookieOptions, maxAge: 0 });
}
