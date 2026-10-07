'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase-client';
import { 
  HomeIcon, 
  TableCellsIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Entries', href: '/dashboard/entries', icon: TableCellsIcon },
  { name: 'Export', href: '/dashboard/export', icon: ArrowDownTrayIcon },
  { name: 'Import', href: '/dashboard/import', icon: ArrowUpTrayIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col w-64 bg-[#0a1a14] border-r border-dark-border h-full min-h-screen">
      <div className="flex items-center justify-center h-16 px-4 border-b border-dark-border">
        <h1 className="text-xl font-bold text-white tracking-wider">ENTRY BOOK</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-dark-card text-primary' 
                    : 'text-gray-300 hover:bg-dark-card hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 flex border-t border-dark-border p-4">
        <button
          onClick={handleLogout}
          className="flex-shrink-0 w-full group block text-gray-300 hover:text-white transition-colors"
        >
          <div className="flex items-center">
            <ArrowRightOnRectangleIcon className="inline-block h-5 w-5 mr-2 text-gray-400 group-hover:text-gray-300" />
            <span className="text-sm font-medium">Log out</span>
          </div>
        </button>
      </div>
    </div>
  );
}
