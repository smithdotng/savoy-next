'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/menu', label: 'Update Menu' },
  { href: '/menu/reservations', label: 'View Table Reservations' }
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="admin-tabs">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`admin-tab ${pathname === tab.href ? 'active' : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
