import { categories } from '@/lib/categories';
import AdminMenuDashboard from '@/components/admin/AdminMenuDashboard';

export const metadata = {
  title: 'Update Menu - Savoy Summerset'
};

export default function MenuAdminPage() {
  return <AdminMenuDashboard categories={categories} />;
}
