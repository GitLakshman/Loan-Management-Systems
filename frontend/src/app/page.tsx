'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types';
import { Shield, ArrowRight, Users, CreditCard, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === Role.BORROWER) {
        router.push('/borrower/status');
      } else {
        router.push('/dashboard/sales');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* Hero Section */}
      <nav className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">LoanFlow</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300 font-medium">Enterprise-Grade Security</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text">Smart Loan</span>
            <br />
            <span className="text-white">Management System</span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Streamline your entire loan lifecycle — from application to disbursement to collection. 
            Built with enterprise-grade architecture, real-time tracking, and role-based access control.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Link href="/register" className="btn-primary text-base px-8 py-3">
              Apply for a Loan <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3">
              Executive Login
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="glass-card p-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Borrower Portal</h3>
              <p className="text-sm text-slate-400">
                Multi-step application with BRE eligibility checks, document upload, and real-time status tracking.
              </p>
            </div>

            <div className="glass-card p-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Operations Dashboard</h3>
              <p className="text-sm text-slate-400">
                Role-based modules for Sales, Sanction, Disbursement, and Collection with full lifecycle management.
              </p>
            </div>

            <div className="glass-card p-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Business Rules Engine</h3>
              <p className="text-sm text-slate-400">
                Automated eligibility validation with PAN, age, salary, and employment checks on both frontend and backend.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
