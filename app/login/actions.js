'use server';

import { redirect } from 'next/navigation';
import { verifyAdminCredentials } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';

export async function loginAction(formData) {
  const username = formData.get('username');
  const password = formData.get('password');

  const valid = await verifyAdminCredentials(username, password);

  if (!valid) {
    redirect('/login?error=1');
  }

  await setSessionCookie({ username });
  redirect('/menu');
}
