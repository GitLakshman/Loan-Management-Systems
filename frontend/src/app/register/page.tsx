'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { CreditCard, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleError } from '@/lib/errorHandler';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phoneNumber: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName || form.fullName.length < 2) errs.fullName = 'Full name is required (min 2 chars)';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.phoneNumber || form.phoneNumber.length < 10) errs.phoneNumber = 'Valid phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authService.register(form);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success('Registration successful! Welcome aboard.');
        router.push('/borrower/personal-details');
      }
    } catch (err) {
      handleError(err, 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">LoanFlow</span>
          </Link>
          <h2 className="text-2xl font-bold text-white mt-6 mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm">Start your loan application journey</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-fullname"
                  type="text"
                  placeholder="John Doe"
                  className={`input-field pl-11 ${errors.fullName ? 'input-error' : ''}`}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              {errors.fullName && <p className="error-text">{errors.fullName}</p>}
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-email"
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
              <label className="input-label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-phone"
                  type="tel"
                  placeholder="9876543210"
                  className={`input-field pl-11 ${errors.phoneNumber ? 'input-error' : ''}`}
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </div>
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
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
              id="register-submit"
            >
              {loading ? (
                <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign In <ArrowRight className="inline w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
