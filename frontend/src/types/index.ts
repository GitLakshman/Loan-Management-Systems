export enum Role {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  SANCTION = 'SANCTION',
  DISBURSEMENT = 'DISBURSEMENT',
  COLLECTION = 'COLLECTION',
  BORROWER = 'BORROWER',
}

export enum LoanStatus {
  DRAFT = 'DRAFT',
  APPLIED = 'APPLIED',
  SANCTIONED = 'SANCTIONED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED',
}

export enum EmploymentMode {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  BUSINESS = 'BUSINESS',
  UNEMPLOYED = 'UNEMPLOYED',
}

export interface User {
  _id: string;
  id?: string;
  fullName: string;
  email: string;
  role: Role;
  phoneNumber: string;
  isActive?: boolean;
}

export interface Loan {
  _id: string;
  borrowerId: User | string;
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipUrl: string;
  loanAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  status: LoanStatus;
  sanctionRemarks: string;
  rejectionReason: string;
  disbursedAt?: string;
  closedAt?: string;
  outstandingAmount: number;
  totalPaidAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  createdBy: User | string;
  createdAt: string;
}

export interface DashboardStats {
  totalBorrowers: number;
  totalLoans: number;
  statusBreakdown: {
    draft: number;
    applied: number;
    sanctioned: number;
    rejected: number;
    disbursed: number;
    closed: number;
  };
  financial: {
    totalDisbursed: number;
    totalRepayment: number;
    totalCollected: number;
    totalOutstanding: number;
  };
  totalPayments: number;
  recentLoans: Loan[];
  salesLeads: User[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
