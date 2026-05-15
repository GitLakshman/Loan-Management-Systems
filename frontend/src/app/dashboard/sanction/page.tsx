'use client';

import { useState, useEffect } from 'react';
import { loanService } from '@/services/loan.service';
import { Loan } from '@/types';
import { Shield, CheckCircle, XCircle, User, IndianRupee, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleError } from '@/lib/errorHandler';

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const fetchLoans = async () => {
    try {
      const res = await loanService.getSanctionLoans();
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

  const handleApprove = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      const res = await loanService.approveLoan(loanId, remarks);
      if (res.success) {
        toast.success('Loan sanctioned successfully!');
        setApproveModal(null);
        setRemarks('');
        fetchLoans();
      }
    } catch (err) {
      handleError(err, 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (loanId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setActionLoading(loanId);
    try {
      const res = await loanService.rejectLoan(loanId, rejectReason);
      if (res.success) {
        toast.success('Loan rejected');
        setRejectModal(null);
        setRejectReason('');
        fetchLoans();
      }
    } catch (err) {
      handleError(err, 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-400" />
            Sanction Module
          </h1>
          <p className="text-slate-400 text-sm">Review and approve/reject loan applications</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Pending Applications</h3>
          <p className="text-slate-400 text-sm">All applications have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const borrower = typeof loan.borrowerId === 'object' ? loan.borrowerId : null;

            return (
              <div key={loan._id} className="glass-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-white font-semibold">{loan.fullName}</h3>
                      <span className="badge badge-applied">APPLIED</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">PAN</p>
                        <p className="text-white font-medium">{loan.pan}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Salary</p>
                        <p className="text-white font-medium">₹{loan.monthlySalary?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Loan Amount</p>
                        <p className="text-white font-medium flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {loan.loanAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Tenure</p>
                        <p className="text-white font-medium">{loan.tenureDays} days</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Interest</p>
                        <p className="text-amber-400 font-medium">₹{loan.interestAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Total Repayment</p>
                        <p className="text-emerald-400 font-medium">₹{loan.totalRepayment.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Employment</p>
                        <p className="text-white font-medium">{loan.employmentMode}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Applied Date</p>
                        <p className="text-white font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {borrower && (
                      <div className="mt-3 text-xs text-slate-500">
                        Email: {borrower.email} • Phone: {borrower.phoneNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setApproveModal(loan._id)}
                      className="btn-success"
                      disabled={actionLoading === loan._id}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModal(loan._id)}
                      className="btn-danger"
                      disabled={actionLoading === loan._id}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="modal-overlay" onClick={() => setApproveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Approve Loan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="input-label">Remarks (Optional)</label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Add any remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setApproveModal(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(approveModal)}
                  className="btn-success flex-1"
                  disabled={actionLoading === approveModal}
                >
                  {actionLoading === approveModal ? 'Processing...' : 'Confirm Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Reject Loan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="input-label">Rejection Reason *</label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Provide a reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRejectModal(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(rejectModal)}
                  className="btn-danger flex-1"
                  disabled={actionLoading === rejectModal}
                >
                  {actionLoading === rejectModal ? 'Processing...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
