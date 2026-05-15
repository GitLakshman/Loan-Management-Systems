'use client';

import { useState, useEffect } from 'react';
import { loanService } from '@/services/loan.service';
import { Loan } from '@/types';
import { Banknote, User, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleError } from '@/lib/errorHandler';

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [disburseModal, setDisburseModal] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      const res = await loanService.getDisbursementLoans();
      if (res.success && res.data) setLoans(res.data.loans);
    } catch (err) { handleError(err, 'Failed to fetch loans'); }
    finally { setLoading(false); }
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

  const handleDisburse = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      const res = await loanService.disburseLoan(loanId);
      if (res.success) {
        toast.success('Loan disbursed successfully!');
        setDisburseModal(null);
        fetchLoans();
      }
    } catch (err) {
      handleError(err, 'Failed to disburse');
    } finally { setActionLoading(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            <Banknote className="w-6 h-6 text-purple-400" />
            Disbursement Module
          </h1>
          <p className="text-slate-400 text-sm">Disburse sanctioned loans to borrowers</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Banknote className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Sanctioned Loans</h3>
          <p className="text-slate-400 text-sm">No loans pending disbursement.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>PAN</th>
                  <th>Loan Amount</th>
                  <th>Interest</th>
                  <th>Total Repayment</th>
                  <th>Tenure</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const borrower = typeof loan.borrowerId === 'object' ? loan.borrowerId : null;
                  return (
                    <tr key={loan._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-400" />
                          <div>
                            <p className="font-medium text-white">{loan.fullName}</p>
                            {borrower && <p className="text-xs text-slate-500">{borrower.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{loan.pan}</td>
                      <td className="font-semibold text-white">₹{loan.loanAmount.toLocaleString()}</td>
                      <td className="text-amber-400">₹{loan.interestAmount.toLocaleString()}</td>
                      <td className="text-emerald-400 font-semibold">₹{loan.totalRepayment.toLocaleString()}</td>
                      <td>{loan.tenureDays} days</td>
                      <td><span className="badge badge-sanctioned">SANCTIONED</span></td>
                      <td>
                        <button
                          onClick={() => setDisburseModal(loan._id)}
                          className="btn-primary text-xs px-3 py-1.5"
                          disabled={actionLoading === loan._id}
                        >
                          <Send className="w-3 h-3" />Disburse
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {disburseModal && (
        <div className="modal-overlay" onClick={() => setDisburseModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-purple-400" />Confirm Disbursement
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to disburse this loan? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDisburseModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => handleDisburse(disburseModal)}
                className="btn-primary flex-1"
                disabled={actionLoading === disburseModal}
              >
                {actionLoading === disburseModal ? 'Processing...' : 'Confirm Disburse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
