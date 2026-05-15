'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Role } from '@/types';
import { CreditCard, Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleError } from '@/lib/errorHandler';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authService.login(form);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success('Login successful!');
        if (res.data.user.role === Role.BORROWER) {
          router.push('/borrower/status');
        } else {
          router.push('/dashboard/sales');
        }
      }
    } catch (err) {
      handleError(err, 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">LoanFlow</span>
          </Link>
          <h2 className="text-2xl font-bold text-white mt-6 mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className={`input-field pl-11 ${errors.email ? 'input-error' : ''}`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`input-field pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
              id="login-submit"
            >
              {loading ? (
                <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Create Account <ArrowRight className="inline w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Login Hints */}
        <div className="glass-card p-4 mt-4">
          <p className="text-xs text-slate-500 text-center mb-3 uppercase font-semibold tracking-wider">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { role: 'Admin', email: 'admin@test.com' },
              { role: 'Sales', email: 'sales@test.com' },
              { role: 'Sanction', email: 'sanction@test.com' },
              { role: 'Collection', email: 'collection@test.com' },
            ].map((acc) => (
              <button
                key={acc.role}
                type="button"
                className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setForm({ email: acc.email, password: 'Password@123' })}
              >
                <span className="text-slate-400 font-medium">{acc.role}:</span>
                <span className="text-indigo-400 ml-1 break-all">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
