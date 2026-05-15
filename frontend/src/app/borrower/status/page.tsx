'use client';

import { useState, useEffect } from 'react';
import { loanService } from '@/services/loan.service';
import { Loan, LoanStatus } from '@/types';
import { BarChart3, Clock, CheckCircle, XCircle, CreditCard, AlertCircle, IndianRupee, RefreshCw } from 'lucide-react';
import { handleError } from '@/lib/errorHandler';
import Link from 'next/link';

const statusConfig: Record<string, { color: string; badge: string; icon: React.ElementType }> = {
  DRAFT: { color: 'text-slate-400', badge: 'badge-draft', icon: Clock },
  APPLIED: { color: 'text-blue-400', badge: 'badge-applied', icon: Clock },
  SANCTIONED: { color: 'text-amber-400', badge: 'badge-sanctioned', icon: CheckCircle },
  REJECTED: { color: 'text-red-400', badge: 'badge-rejected', icon: XCircle },
  DISBURSED: { color: 'text-indigo-400', badge: 'badge-disbursed', icon: CreditCard },
  CLOSED: { color: 'text-emerald-400', badge: 'badge-closed', icon: CheckCircle },
};

export default function StatusPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const res = await loanService.getMyLoans();
      if (res.success && res.data) {
        setLoans(res.data.loans);
      }
    } catch (err) {
      handleError(err, 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchLoans();
  };

  useEffect(() => {
    const init = async () => {
      await fetchLoans();
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">My Loans</h2>
            <p className="text-sm text-slate-400">Track your loan applications and status</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="btn-secondary text-xs px-3 py-2">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
          <Link href="/borrower/personal-details" className="btn-primary text-xs px-3 py-2">
            + New Application
          </Link>
        </div>
      </div>

      {loans.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Loan Applications</h3>
          <p className="text-slate-400 text-sm mb-6">Start your first loan application to see it here.</p>
          <Link href="/borrower/personal-details" className="btn-primary">
            Apply for a Loan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const config = statusConfig[loan.status] || statusConfig.DRAFT;
            const StatusIcon = config.icon;

            return (
              <div key={loan._id} className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color} bg-current/10`}
                         style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{loan.fullName}</h3>
                      <p className="text-xs text-slate-500 mt-1">PAN: {loan.pan} • {loan.employmentMode}</p>
                      <p className="text-xs text-slate-500">
                        Applied: {new Date(loan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {loan.loanAmount > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Loan Amount</p>
                        <p className="text-white font-bold flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {loan.loanAmount.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {loan.status === LoanStatus.DISBURSED && (
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Outstanding</p>
                        <p className="text-amber-400 font-bold">₹{loan.outstandingAmount.toLocaleString()}</p>
                      </div>
                    )}

                    <span className={`badge ${config.badge}`}>{loan.status}</span>
                  </div>
                </div>

                {/* Status Details */}
                {loan.status === LoanStatus.REJECTED && loan.rejectionReason && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">
                      <strong>Rejection Reason:</strong> {loan.rejectionReason}
                    </p>
                  </div>
                )}

                {loan.status === LoanStatus.SANCTIONED && loan.sanctionRemarks && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400">
                      <strong>Sanction Remarks:</strong> {loan.sanctionRemarks}
                    </p>
                  </div>
                )}

                {loan.status === LoanStatus.CLOSED && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400">
                      <strong>Loan Closed:</strong> Total paid ₹{loan.totalPaidAmount.toLocaleString()}
                      {loan.closedAt && ` • ${new Date(loan.closedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                )}

                {/* Progress bar for disbursed loans */}
                {loan.status === LoanStatus.DISBURSED && loan.totalRepayment > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Paid: ₹{loan.totalPaidAmount.toLocaleString()}</span>
                      <span>Total: ₹{loan.totalRepayment.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min((loan.totalPaidAmount / loan.totalRepayment) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
