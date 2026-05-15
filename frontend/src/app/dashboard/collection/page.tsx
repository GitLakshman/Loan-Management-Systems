'use client';

import { useState, useEffect } from 'react';
import { loanService } from '@/services/loan.service';
import { paymentService } from '@/services/payment.service';
import { Loan, Payment, LoanStatus } from '@/types';
import { Wallet, IndianRupee, RefreshCw, Plus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleError } from '@/lib/errorHandler';

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [viewPayments, setViewPayments] = useState<string | null>(null);
  const [form, setForm] = useState({ utrNumber: '', amount: '', paymentDate: '' });

  const fetchLoans = async () => {
    try {
      const res = await loanService.getCollectionLoans();
      if (res.success && res.data) setLoans(res.data.loans);
    } catch (err) { handleError(err, 'Failed to fetch loans'); }
    finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchLoans();
  };

  const fetchPayments = async (loanId: string) => {
    try {
      const res = await paymentService.getLoanPayments(loanId);
      if (res.success && res.data) setPayments(res.data.payments);
    } catch (err) { handleError(err, 'Failed to fetch payments'); }
  };

  useEffect(() => {
    const init = async () => {
      await fetchLoans();
    };
    init();
  }, []);

  const handlePayment = async () => {
    if (!paymentModal) return;
    if (!form.utrNumber || !form.amount || !form.paymentDate) {
      toast.error('All fields are required');
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await paymentService.recordPayment(paymentModal, {
        utrNumber: form.utrNumber,
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
      });
      if (res.success) {
        toast.success('Payment recorded!');
        setPaymentModal(null);
        setForm({ utrNumber: '', amount: '', paymentDate: '' });
        fetchLoans();
      }
    } catch (err) {
      handleError(err, 'Payment failed');
    } finally { setPaymentLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Collection Module
          </h1>
          <p className="text-slate-400 text-sm">Record payments and track loan closures</p>
        </div>
        <button onClick={handleRefresh} className="btn-secondary text-sm"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      {loans.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Disbursed Loans</h3>
          <p className="text-slate-400 text-sm">No loans available for collection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const borrower = typeof loan.borrowerId === 'object' ? loan.borrowerId : null;
            const progress = loan.totalRepayment > 0 ? Math.min((loan.totalPaidAmount / loan.totalRepayment) * 100, 100) : 0;

            return (
              <div key={loan._id} className="glass-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-white font-semibold">{loan.fullName}</h3>
                      <span className={`badge badge-${loan.status.toLowerCase()}`}>{loan.status}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div><p className="text-slate-500 text-xs">Loan Amount</p><p className="text-white font-medium">₹{loan.loanAmount.toLocaleString()}</p></div>
                      <div><p className="text-slate-500 text-xs">Total Repayment</p><p className="text-white font-medium">₹{loan.totalRepayment.toLocaleString()}</p></div>
                      <div><p className="text-slate-500 text-xs">Paid</p><p className="text-emerald-400 font-medium">₹{loan.totalPaidAmount.toLocaleString()}</p></div>
                      <div><p className="text-slate-500 text-xs">Outstanding</p><p className="text-amber-400 font-medium">₹{loan.outstandingAmount.toLocaleString()}</p></div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{progress.toFixed(1)}% paid</p>
                    {borrower && <p className="text-xs text-slate-500 mt-1">{borrower.email} • {borrower.phoneNumber}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setViewPayments(viewPayments === loan._id ? null : loan._id); if (viewPayments !== loan._id) fetchPayments(loan._id); }} className="btn-secondary text-xs">View Payments</button>
                    {loan.status === LoanStatus.DISBURSED && (
                      <button onClick={() => setPaymentModal(loan._id)} className="btn-primary text-xs"><Plus className="w-3 h-3" />Record Payment</button>
                    )}
                  </div>
                </div>
                {viewPayments === loan._id && (
                  <div className="mt-4 border-t border-slate-700 pt-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Payment History</h4>
                    {payments.length === 0 ? <p className="text-xs text-slate-500">No payments recorded yet</p> : (
                      <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>UTR</th><th>Amount</th><th>Date</th><th>Recorded By</th></tr></thead><tbody>
                        {payments.map((p) => (<tr key={p._id}><td className="font-mono text-xs">{p.utrNumber}</td><td className="text-emerald-400 font-medium">₹{p.amount.toLocaleString()}</td><td>{new Date(p.paymentDate).toLocaleDateString()}</td><td>{typeof p.createdBy === 'object' ? p.createdBy.fullName : '—'}</td></tr>))}
                      </tbody></table></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {paymentModal && (
        <div className="modal-overlay" onClick={() => setPaymentModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-emerald-400" />Record Payment</h3>
            <div className="space-y-4">
              <div><label className="input-label">UTR Number</label><input className="input-field" placeholder="Enter UTR number" value={form.utrNumber} onChange={(e) => setForm({ ...form, utrNumber: e.target.value })} /></div>
              <div><label className="input-label">Amount (₹)</label><input type="number" className="input-field" placeholder="Enter amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div><label className="input-label">Payment Date</label><input type="date" className="input-field" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} /></div>
              <div className="flex gap-3">
                <button onClick={() => setPaymentModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handlePayment} className="btn-success flex-1" disabled={paymentLoading}>{paymentLoading ? 'Processing...' : 'Record Payment'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
