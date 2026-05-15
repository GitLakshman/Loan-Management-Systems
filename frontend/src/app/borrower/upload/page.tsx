'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loanService } from '@/services/loan.service';
import { useLoanStore } from '@/store/loanStore';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleError } from '@/lib/errorHandler';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadPage() {
  const router = useRouter();
  const { currentLoan, setStep } = useLoanStore();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) return 'Only PDF, JPG, and PNG files are allowed';
    if (f.size > MAX_SIZE) return 'File size must be under 5MB';
    return null;
  };

  const handleFileSelect = (f: File) => {
    const error = validateFile(f);
    if (error) {
      toast.error(error);
      return;
    }
    setFile(f);
    setUploaded(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleUpload = async () => {
    if (!file || !currentLoan) {
      toast.error('Please select a file and ensure you have a draft loan');
      return;
    }

    setLoading(true);
    try {
      const res = await loanService.uploadSalarySlip(currentLoan._id, file);
      if (res.success) {
        setUploaded(true);
        setStep(3);
        toast.success('Salary slip uploaded successfully!');
      }
    } catch (err) {
      handleError(err, 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!currentLoan) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Draft Loan Found</h3>
        <p className="text-slate-400 text-sm mb-4">
          Please complete your personal details first to create a loan draft.
        </p>
        <button onClick={() => router.push('/borrower/personal-details')} className="btn-primary">
          Go to Personal Details
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
                s.num < 2 ? 'stepper-circle-completed' :
                s.num === 2 ? 'stepper-circle-active' : 'stepper-circle-inactive'
              }`}>
                {s.num < 2 ? '✓' : s.num}
              </div>
              {i < 3 && <div className={`stepper-line ${s.num <= 2 ? 'stepper-line-active' : 'stepper-line-inactive'}`} />}
            </div>
            <span className="stepper-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Upload className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Upload Salary Slip</h2>
            <p className="text-sm text-slate-400">Step 2: Upload your latest salary slip for verification</p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-indigo-500 bg-indigo-500/10'
              : file
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <FileText className="w-12 h-12 text-emerald-400" />
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              {uploaded && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Uploaded successfully
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-slate-500" />
              <p className="text-slate-300 font-medium">Drag & drop your salary slip here</p>
              <p className="text-sm text-slate-500">or click to browse</p>
              <p className="text-xs text-slate-600">PDF, JPG, PNG • Max 5MB</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || loading || uploaded}
            className="btn-primary flex-1 py-3"
          >
            {loading ? (
              <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : uploaded ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload File
              </>
            )}
          </button>

          {uploaded && (
            <button
              onClick={() => router.push('/borrower/loan-config')}
              className="btn-success flex-1 py-3"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
