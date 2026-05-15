import { z } from 'zod';

export const personalDetailsSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)'),
  dob: z.string().min(1, 'Date of birth is required'),
  monthlySalary: z.number().min(0, 'Salary cannot be negative'),
  employmentMode: z.enum(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'UNEMPLOYED']),
});

export const loanApplySchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  loanAmount: z.number().min(10000, 'Minimum loan amount is ₹10,000').max(500000, 'Maximum loan amount is ₹5,00,000'),
  tenureDays: z.number().min(30, 'Minimum tenure is 30 days').max(365, 'Maximum tenure is 365 days'),
});

export const sanctionSchema = z.object({
  remarks: z.string().optional(),
});

export const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export const paymentSchema = z.object({
  utrNumber: z.string().min(1, 'UTR number is required'),
  amount: z.number().min(1, 'Payment amount must be at least ₹1'),
  paymentDate: z.string().min(1, 'Payment date is required'),
});
