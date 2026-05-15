'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types';
import Link from 'next/link';
import {
  CreditCard, Users, Shield, Banknote,
  Wallet, LogOut, ChevronRight,
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
}

const sidebarLinks: SidebarLink[] = [
  { href: '/dashboard/sales', label: 'Sales', icon: Users, roles: [Role.ADMIN, Role.SALES] },
  { href: '/dashboard/sanction', label: 'Sanction', icon: Shield, roles: [Role.ADMIN, Role.SANCTION] },
  { href: '/dashboard/disbursement', label: 'Disbursement', icon: Banknote, roles: [Role.ADMIN, Role.DISBURSEMENT] },
  { href: '/dashboard/collection', label: 'Collection', icon: Wallet, roles: [Role.ADMIN, Role.COLLECTION] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hydrate, logout, isLoading } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === Role.BORROWER) {
        router.push('/borrower/status');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  const visibleLinks = sidebarLinks.filter(
    (link) => user?.role && link.roles.includes(user.role as Role)
  );

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">LoanFlow</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-6 mb-6">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-white font-semibold truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Nav Label */}
        <div className="px-6 mb-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Operations</p>
        </div>

        {/* Nav Links */}
        <nav className="space-y-0.5">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${pathname === link.href ? 'sidebar-link-active' : ''}`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
              {pathname === link.href && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="page-content">
        {children}
      </main>
    </div>
  );
}
