import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { loginAction } from './actions';

export const metadata = {
  title: 'Login - Savoy Summerset Menu'
};

export default async function LoginPage({ searchParams }) {
  const session = await getSession();
  if (session) {
    redirect('/menu');
  }

  const resolvedSearchParams = await searchParams;
  const hasError = resolvedSearchParams?.error === '1';

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1>Admin Login</h1>
        {hasError ? <div className="admin-alert danger">Incorrect username or password</div> : null}
        <form className="admin-form" action={loginAction}>
          <div>
            <input className="admin-input" type="text" name="username" placeholder="Username" required />
          </div>
          <div>
            <input className="admin-input" type="password" name="password" placeholder="Password" required />
          </div>
          <button className="admin-btn" type="submit">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
