import { create } from 'zustand';
import { Loan } from '@/types';

interface LoanState {
  currentLoan: Loan | null;
  loans: Loan[];
  step: number;
  setCurrentLoan: (loan: Loan) => void;
  setLoans: (loans: Loan[]) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useLoanStore = create<LoanState>((set) => ({
  currentLoan: null,
  loans: [],
  step: 1,

  setCurrentLoan: (loan: Loan) => set({ currentLoan: loan }),
  setLoans: (loans: Loan[]) => set({ loans }),
  setStep: (step: number) => set({ step }),
  reset: () => set({ currentLoan: null, step: 1 }),
}));
