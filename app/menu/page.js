import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { categories } from '@/lib/categories';
import AdminMenuDashboard from '@/components/admin/AdminMenuDashboard';

export const metadata = {
  title: 'Update Menu - Savoy Summerset'
};

export default async function MenuAdminPage() {
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
        <AdminMenuDashboard categories={categories} />
      </div>
    </div>
  );
}
