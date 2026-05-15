'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loanService } from '@/services/loan.service';
import { useLoanStore } from '@/store/loanStore';
import { Settings, IndianRupee, Calendar, Calculator, AlertCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleError } from '@/lib/errorHandler';

export default function LoanConfigPage() {
  const router = useRouter();
  const { currentLoan, setCurrentLoan, setStep } = useLoanStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ loanAmount: '', tenureDays: '' });

  // Calculate preview
  const loanAmount = Number(form.loanAmount) || 0;
  const tenureDays = Number(form.tenureDays) || 0;
  const interestRate = 8;
  const interestAmount = Math.round((loanAmount * interestRate * tenureDays) / (365 * 100));
  const totalRepayment = loanAmount + interestAmount;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.loanAmount) errs.loanAmount = 'Loan amount is required';
    else if (loanAmount < 10000) errs.loanAmount = 'Minimum: ₹10,000';
    else if (loanAmount > 500000) errs.loanAmount = 'Maximum: ₹5,00,000';
    if (!form.tenureDays) errs.tenureDays = 'Tenure is required';
    else if (tenureDays < 30) errs.tenureDays = 'Minimum: 30 days';
    else if (tenureDays > 365) errs.tenureDays = 'Maximum: 365 days';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!currentLoan) {
      toast.error('No draft loan found. Please start from personal details.');
      return;
    }

    setLoading(true);
    try {
      const res = await loanService.applyLoan({
        loanId: currentLoan._id,
        loanAmount,
        tenureDays,
      });

      if (res.success && res.data) {
        setCurrentLoan(res.data.loan);
        setStep(4);
        toast.success('Loan application submitted successfully! 🎉');
        router.push('/borrower/status');
      }
    } catch (err) {
      handleError(err, 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (!currentLoan) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Draft Loan Found</h3>
        <p className="text-slate-400 text-sm mb-4">Please complete the previous steps first.</p>
        <button onClick={() => router.push('/borrower/personal-details')} className="btn-primary">
          Start Application
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Stepper */}
      <div className="stepper mb-10">
        {[
          { num: 1, label: 'Personal' },
          { num: 2, label: 'Upload' },
          { num: 3, label: 'Loan Config' },
          { num: 4, label: 'Status' },
        ].map((s, i) => (
          <div key={s.num} className="stepper-item flex flex-col items-center">
            <div className="flex items-center">
              <div className={`stepper-circle ${
                s.num < 3 ? 'stepper-circle-completed' :
                s.num === 3 ? 'stepper-circle-active' : 'stepper-circle-inactive'
              }`}>
                {s.num < 3 ? '✓' : s.num}
              </div>
              {i < 3 && <div className={`stepper-line ${s.num <= 3 ? 'stepper-line-active' : 'stepper-line-inactive'}`} />}
            </div>
            <span className="stepper-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Loan Configuration</h2>
              <p className="text-sm text-slate-400">Step 3: Configure your loan amount and tenure</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Loan Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="loan-amount"
                  type="number"
                  placeholder="₹10,000 - ₹5,00,000"
                  className={`input-field pl-11 ${errors.loanAmount ? 'input-error' : ''}`}
                  value={form.loanAmount}
                  onChange={(e) => setForm({ ...form, loanAmount: e.target.value })}
                />
              </div>
              {errors.loanAmount && <p className="error-text">{errors.loanAmount}</p>}
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={loanAmount || 10000}
                onChange={(e) => setForm({ ...form, loanAmount: e.target.value })}
                className="w-full mt-2 accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>₹10,000</span>
                <span>₹5,00,000</span>
              </div>
            </div>

            <div>
              <label className="input-label">Tenure (Days)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="loan-tenure"
                  type="number"
                  placeholder="30 - 365 days"
                  className={`input-field pl-11 ${errors.tenureDays ? 'input-error' : ''}`}
                  value={form.tenureDays}
                  onChange={(e) => setForm({ ...form, tenureDays: e.target.value })}
                />
              </div>
              {errors.tenureDays && <p className="error-text">{errors.tenureDays}</p>}
              <input
                type="range"
                min="30"
                max="365"
                step="15"
                value={tenureDays || 30}
                onChange={(e) => setForm({ ...form, tenureDays: e.target.value })}
                className="w-full mt-2 accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>30 days</span>
                <span>365 days</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3" id="loan-submit">
              {loading ? (
                <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 glass-card p-6 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Loan Summary</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400 text-sm">Principal Amount</span>
              <span className="text-white font-semibold">₹{loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400 text-sm">Tenure</span>
              <span className="text-white font-semibold">{tenureDays} days</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400 text-sm">Interest Rate</span>
              <span className="text-white font-semibold">{interestRate}% p.a.</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400 text-sm">Interest Amount</span>
              <span className="text-amber-400 font-semibold">₹{interestAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 bg-indigo-500/10 rounded-xl px-4 -mx-2">
              <span className="text-indigo-300 font-semibold">Total Repayment</span>
              <span className="text-white font-bold text-lg">₹{totalRepayment.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
