'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loanService } from '@/services/loan.service';
import { useLoanStore } from '@/store/loanStore';
import { EmploymentMode } from '@/types';
import { User, CreditCard, Calendar, Briefcase, IndianRupee, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleError } from '@/lib/errorHandler';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export default function PersonalDetailsPage() {
  const router = useRouter();
  const { setCurrentLoan, setStep } = useLoanStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fullName: '',
    pan: '',
    dob: '',
    monthlySalary: '',
    employmentMode: '',
  });

  // BRE client-side checks
  const checkBRE = () => {
    const errs: Record<string, string> = {};

    if (!form.fullName || form.fullName.length < 2) errs.fullName = 'Full name is required';
    if (!form.pan) errs.pan = 'PAN is required';
    else if (!PAN_REGEX.test(form.pan.toUpperCase())) errs.pan = 'Invalid PAN (e.g., ABCDE1234F)';

    if (!form.dob) {
      errs.dob = 'Date of birth is required';
    } else {
      const age = Math.floor((new Date().getTime() - new Date(form.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 23 || age > 50) errs.dob = `Age must be 23-50 (current: ${age})`;
    }

    if (!form.monthlySalary) errs.monthlySalary = 'Monthly salary is required';
    else if (Number(form.monthlySalary) < 25000) errs.monthlySalary = 'Minimum salary: ₹25,000';

    if (!form.employmentMode) errs.employmentMode = 'Employment mode is required';
    else if (form.employmentMode === EmploymentMode.UNEMPLOYED) errs.employmentMode = 'Unemployed applicants are not eligible';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkBRE()) return;

    setLoading(true);
    try {
      const res = await loanService.savePersonalDetails({
        fullName: form.fullName,
        pan: form.pan.toUpperCase(),
        dob: form.dob,
        monthlySalary: Number(form.monthlySalary),
        employmentMode: form.employmentMode,
      });

      if (res.success && res.data) {
        setCurrentLoan(res.data.loan);
        setStep(2);
        toast.success('Personal details saved! BRE check passed ✓');
        router.push('/borrower/upload');
      }
    } catch (err) {
      handleError(err, 'Failed to save details');
    } finally {
      setLoading(false);
    }
  };

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
              <div className={`stepper-circle ${s.num === 1 ? 'stepper-circle-active' : 'stepper-circle-inactive'}`}>
                {s.num}
              </div>
              {i < 3 && <div className={`stepper-line ${s.num < 2 ? 'stepper-line-active' : 'stepper-line-inactive'}`} />}
            </div>
            <span className="stepper-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Personal Details</h2>
            <p className="text-sm text-slate-400">Step 1: Enter your personal information for BRE eligibility</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="personal-fullname"
                  type="text"
                  placeholder="Enter full name"
                  className={`input-field pl-11 ${errors.fullName ? 'input-error' : ''}`}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              {errors.fullName && <p className="error-text">{errors.fullName}</p>}
            </div>

            <div>
              <label className="input-label">PAN Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="personal-pan"
                  type="text"
                  placeholder="ABCDE1234F"
                  className={`input-field pl-11 uppercase ${errors.pan ? 'input-error' : ''}`}
                  value={form.pan}
                  onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                  maxLength={10}
                />
              </div>
              {errors.pan && <p className="error-text">{errors.pan}</p>}
            </div>

            <div>
              <label className="input-label">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="personal-dob"
                  type="date"
                  className={`input-field pl-11 ${errors.dob ? 'input-error' : ''}`}
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
              {errors.dob && <p className="error-text">{errors.dob}</p>}
            </div>

            <div>
              <label className="input-label">Monthly Salary (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="personal-salary"
                  type="number"
                  placeholder="Minimum ₹25,000"
                  className={`input-field pl-11 ${errors.monthlySalary ? 'input-error' : ''}`}
                  value={form.monthlySalary}
                  onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })}
                />
              </div>
              {errors.monthlySalary && <p className="error-text">{errors.monthlySalary}</p>}
            </div>
          </div>

          <div>
            <label className="input-label">Employment Mode</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                id="personal-employment"
                className={`input-field pl-11 appearance-none ${errors.employmentMode ? 'input-error' : ''}`}
                value={form.employmentMode}
                onChange={(e) => setForm({ ...form, employmentMode: e.target.value })}
              >
                <option value="">Select employment mode</option>
                <option value={EmploymentMode.SALARIED}>Salaried</option>
                <option value={EmploymentMode.SELF_EMPLOYED}>Self Employed</option>
                <option value={EmploymentMode.BUSINESS}>Business</option>
                <option value={EmploymentMode.UNEMPLOYED}>Unemployed</option>
              </select>
            </div>
            {errors.employmentMode && <p className="error-text">{errors.employmentMode}</p>}
          </div>

          {/* BRE Rules Info */}
          <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4 mt-4">
            <h4 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              BRE Eligibility Rules
            </h4>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Age between 23 and 50 years</li>
              <li>Monthly salary ≥ ₹25,000</li>
              <li>Valid PAN number (Format: ABCDE1234F)</li>
              <li>Employment: Salaried, Self-Employed, or Business</li>
            </ul>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3" id="personal-submit">
            {loading ? (
              <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              <>
                Save & Continue
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
