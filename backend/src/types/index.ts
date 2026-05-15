import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
