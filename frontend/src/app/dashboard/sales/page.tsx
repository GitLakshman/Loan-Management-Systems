'use client';

import { useState, useEffect } from 'react';
import { paymentService } from '@/services/payment.service';
import { DashboardStats, User, Loan } from '@/types';
import {
  Users, CreditCard, CheckCircle, XCircle,
  Banknote, Wallet, TrendingUp, Clock,
  IndianRupee, BarChart3,
} from 'lucide-react';
import { handleError } from '@/lib/errorHandler';

export default function SalesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await paymentService.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        handleError(err, 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Borrowers', value: stats.totalBorrowers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Loans', value: stats.totalLoans, icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Applied', value: stats.statusBreakdown.applied, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Sanctioned', value: stats.statusBreakdown.sanctioned, icon: CheckCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Disbursed', value: stats.statusBreakdown.disbursed, icon: Banknote, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Closed', value: stats.statusBreakdown.closed, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Rejected', value: stats.statusBreakdown.rejected, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Draft', value: stats.statusBreakdown.draft, icon: BarChart3, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Sales Dashboard</h1>
        <p className="text-slate-400 text-sm">Overview of all loan operations and registered borrowers</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Disbursed', value: stats.financial.totalDisbursed, color: 'text-indigo-400' },
          { label: 'Total Repayment', value: stats.financial.totalRepayment, color: 'text-amber-400' },
          { label: 'Total Collected', value: stats.financial.totalCollected, color: 'text-emerald-400' },
          { label: 'Total Outstanding', value: stats.financial.totalOutstanding, color: 'text-red-400' },
        ].map((item) => (
          <div key={item.label} className="glass-card p-5">
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-2">{item.label}</p>
            <p className={`text-xl font-bold ${item.color} flex items-center gap-1`}>
              <IndianRupee className="w-4 h-4" />
              {item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Sales Leads */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Sales Leads
          </h3>
          <p className="text-xs text-slate-400 mt-1">Registered borrowers who haven&apos;t applied yet</p>
        </div>

        {stats.salesLeads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">No pending leads at the moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.salesLeads.map((lead: User) => (
                  <tr key={lead._id || lead.id}>
                    <td className="font-medium text-white">{lead.fullName}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phoneNumber}</td>
                    <td>
                      <span className="badge badge-draft">No Application</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Loans */}
      <div className="glass-card overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Recent Loan Applications
          </h3>
        </div>

        {stats.recentLoans.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">No loans yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLoans.map((loan: Loan) => (
                  <tr key={loan._id}>
                    <td className="font-medium text-white">{loan.fullName}</td>
                    <td>₹{loan.loanAmount?.toLocaleString() || '—'}</td>
                    <td>
                      <span className={`badge badge-${loan.status.toLowerCase()}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="text-slate-400">{new Date(loan.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
