import { Response } from 'express';
import { AuthRequest, LoanStatus } from '../../types';
import { Payment } from './payment.model';
import { Loan } from '../loans/loan.model';
import { asyncHandler, AppError, sendResponse } from '../../utils/helpers';

/**
 * POST /api/collection/:loanId/payment
 * Record a payment for a disbursed loan
 */
export const recordPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { loanId } = req.params;
  const { utrNumber, amount, paymentDate } = req.body;
  const createdBy = req.user?.userId;

  // Find the loan
  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.status !== LoanStatus.DISBURSED) {
    throw new AppError(`Cannot record payment. Loan status: ${loan.status}`, 400);
  }

  // Check UTR uniqueness
  const existingPayment = await Payment.findOne({ utrNumber });
  if (existingPayment) {
    throw new AppError('UTR number already exists. Duplicate payment.', 409);
  }

  // Check if payment exceeds outstanding
  if (amount > loan.outstandingAmount) {
    throw new AppError(
      `Payment amount (₹${amount}) exceeds outstanding amount (₹${loan.outstandingAmount})`,
      400
    );
  }

  // Record payment
  const payment = await Payment.create({
    loanId,
    utrNumber,
    amount,
    paymentDate: new Date(paymentDate),
    createdBy,
  });

  // Update loan amounts
  loan.totalPaidAmount += amount;
  loan.outstandingAmount -= amount;

  // Auto-close if fully paid
  if (loan.outstandingAmount <= 0) {
    loan.status = LoanStatus.CLOSED;
    loan.closedAt = new Date();
    loan.outstandingAmount = 0;
  }

  await loan.save();

  sendResponse(res, 201, true, 'Payment recorded successfully', {
    payment,
    loan: {
      id: loan._id,
      totalPaidAmount: loan.totalPaidAmount,
      outstandingAmount: loan.outstandingAmount,
      status: loan.status,
    },
  });
});

/**
 * GET /api/collection/:loanId/payments
 * Get all payments for a loan
 */
export const getLoanPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { loanId } = req.params;

  const payments = await Payment.find({ loanId })
    .populate('createdBy', 'fullName email')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, 'Payments fetched', { payments });
});
