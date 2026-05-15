import { Role, LoanStatus, EmploymentMode } from '../types';

export const ROLES = Object.values(Role);
export const LOAN_STATUSES = Object.values(LoanStatus);
export const EMPLOYMENT_MODES = Object.values(EmploymentMode);

export const BRE_RULES = {
  MIN_AGE: 23,
  MAX_AGE: 50,
  MIN_SALARY: 25000,
  VALID_EMPLOYMENT: [EmploymentMode.SALARIED, EmploymentMode.SELF_EMPLOYED, EmploymentMode.BUSINESS],
};

export const LOAN_CONFIG = {
  DEFAULT_INTEREST_RATE: 8, // 8% flat
  MIN_TENURE_DAYS: 30,
  MAX_TENURE_DAYS: 365,
  MIN_LOAN_AMOUNT: 10000,
  MAX_LOAN_AMOUNT: 500000,
};

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Valid loan status transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  [LoanStatus.DRAFT]: [LoanStatus.APPLIED],
  [LoanStatus.APPLIED]: [LoanStatus.SANCTIONED, LoanStatus.REJECTED],
  [LoanStatus.SANCTIONED]: [LoanStatus.DISBURSED],
  [LoanStatus.DISBURSED]: [LoanStatus.CLOSED],
  [LoanStatus.REJECTED]: [],
  [LoanStatus.CLOSED]: [],
};
