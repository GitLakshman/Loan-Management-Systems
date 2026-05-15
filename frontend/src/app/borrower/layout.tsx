'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, User, Upload, Settings, BarChart3, LogOut } from 'lucide-react';

const borrowerLinks = [
  { href: '/borrower/personal-details', label: 'Personal Details', icon: User, step: 1 },
  { href: '/borrower/upload', label: 'Upload Salary Slip', icon: Upload, step: 2 },
  { href: '/borrower/loan-config', label: 'Loan Configuration', icon: Settings, step: 3 },
  { href: '/borrower/status', label: 'Loan Status', icon: BarChart3, step: 4 },
];

export default function BorrowerLayout({ children }: { children: ReactNode }) {
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
      } else if (user?.role !== Role.BORROWER) {
        router.push('/dashboard/sales');
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

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">LoanFlow</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1">
              {borrowerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 hidden sm:block">
                Hi, <span className="text-white font-medium">{user?.fullName}</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-2">
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto border-b border-slate-800 bg-slate-900/50 px-4 py-2 gap-2">
        {borrowerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              pathname === link.href
                ? 'bg-indigo-500/15 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <link.icon className="w-3 h-3" />
            {link.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
