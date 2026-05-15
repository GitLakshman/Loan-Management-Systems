import mongoose, { Schema, Document } from 'mongoose';
import { LoanStatus, EmploymentMode } from '../../types';

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;
  fullName: string;
  pan: string;
  dob: Date;
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
  disbursedAt: Date;
  closedAt: Date;
  outstandingAmount: number;
  totalPaidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Personal Details
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    pan: {
      type: String,
      required: [true, 'PAN is required'],
      trim: true,
      uppercase: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    monthlySalary: {
      type: Number,
      required: [true, 'Monthly salary is required'],
      min: 0,
    },
    employmentMode: {
      type: String,
      enum: Object.values(EmploymentMode),
      required: [true, 'Employment mode is required'],
    },
    // Upload
    salarySlipUrl: {
      type: String,
      default: '',
    },
    // Loan Configuration
    loanAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tenureDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    interestAmount: {
      type: Number,
      default: 0,
    },
    totalRepayment: {
      type: Number,
      default: 0,
    },
    // Lifecycle
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.DRAFT,
    },
    sanctionRemarks: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    disbursedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    // Payment Tracking
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    totalPaidAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
loanSchema.index({ borrowerId: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ borrowerId: 1, status: 1 });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
