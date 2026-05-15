import { Response } from 'express';
import { AuthRequest, LoanStatus, Role } from '../../types';
import { Loan } from '../loans/loan.model';
import { User } from '../users/user.model';
import { Payment } from '../payments/payment.model';
import { asyncHandler, sendResponse } from '../../utils/helpers';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // Total counts
  const totalBorrowers = await User.countDocuments({ role: Role.BORROWER });
  const totalLoans = await Loan.countDocuments();

  // Loan status breakdown
  const loansByStatus = await Loan.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const statusMap: Record<string, number> = {};
  loansByStatus.forEach((item) => {
    statusMap[item._id] = item.count;
  });

  // Financial summaries
  const financialSummary = await Loan.aggregate([
    {
      $match: {
        status: { $in: [LoanStatus.DISBURSED, LoanStatus.CLOSED] },
      },
    },
    {
      $group: {
        _id: null,
        totalDisbursed: { $sum: '$loanAmount' },
        totalRepayment: { $sum: '$totalRepayment' },
        totalCollected: { $sum: '$totalPaidAmount' },
        totalOutstanding: { $sum: '$outstandingAmount' },
      },
    },
  ]);

  // Total payments
  const totalPayments = await Payment.countDocuments();

  // Recent loans
  const recentLoans = await Loan.find()
    .populate('borrowerId', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(10);

  // Registered borrowers without loan applications (for sales)
  const borrowersWithoutLoans = await User.aggregate([
    { $match: { role: Role.BORROWER } },
    {
      $lookup: {
        from: 'loans',
        localField: '_id',
        foreignField: 'borrowerId',
        as: 'loans',
      },
    },
    { $match: { loans: { $size: 0 } } },
    { $project: { password: 0, loans: 0 } },
  ]);

  sendResponse(res, 200, true, 'Dashboard stats fetched', {
    totalBorrowers,
    totalLoans,
    statusBreakdown: {
      draft: statusMap[LoanStatus.DRAFT] || 0,
      applied: statusMap[LoanStatus.APPLIED] || 0,
      sanctioned: statusMap[LoanStatus.SANCTIONED] || 0,
      rejected: statusMap[LoanStatus.REJECTED] || 0,
      disbursed: statusMap[LoanStatus.DISBURSED] || 0,
      closed: statusMap[LoanStatus.CLOSED] || 0,
    },
    financial: financialSummary[0] || {
      totalDisbursed: 0,
      totalRepayment: 0,
      totalCollected: 0,
      totalOutstanding: 0,
    },
    totalPayments,
    recentLoans,
    salesLeads: borrowersWithoutLoans,
  });
});
