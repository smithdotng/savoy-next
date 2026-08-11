import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import AdminTabs from '@/components/admin/AdminTabs';

export default async function MenuLayout({ children }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="admin-page">
      <div className="admin-card" style={{ maxWidth: 700 }}>
        <div className="admin-topbar">
          <a href="/api/logout">Logout</a>
        </div>
        <AdminTabs />
        {children}
      </div>
    </div>
  );
}
