import bcrypt from 'bcryptjs';

export {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  createSessionToken,
  verifySessionToken
} from './auth-edge';

// Same behavior as the original Express app: the admin password lives in
// plaintext in .env, and login compares it via bcrypt rather than a plain
// string check. This function uses bcryptjs (Node runtime only) so it stays
// out of lib/auth-edge.js, which middleware.js (Edge runtime) imports from.
export async function verifyAdminCredentials(username, password) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) return false;
  if (username !== adminUsername) return false;

  const hash = await bcrypt.hash(adminPassword, 10);
  return bcrypt.compare(password, hash);
}
