import { Response } from 'express';
import { AuthRequest, LoanStatus } from '../../types';
import { Loan } from './loan.model';
import { checkEligibility } from '../../utils/bre';
import { calculateLoanDetails } from '../../utils/emi';
import { asyncHandler, AppError, sendResponse } from '../../utils/helpers';
import { VALID_TRANSITIONS } from '../../utils/constants';

// ==================== BORROWER APIs ====================

/**
 * POST /api/loans/personal-details
 * Step 1: Save personal details (creates DRAFT loan)
 */
export const savePersonalDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, pan, dob, monthlySalary, employmentMode } = req.body;
  const borrowerId = req.user?.userId;

  // Run BRE checks
  const breResult = checkEligibility({ dob, monthlySalary, pan, employmentMode });
  if (!breResult.eligible) {
    throw new AppError(`Not eligible: ${breResult.reasons.join('; ')}`, 400);
  }

  // Create draft loan
  const loan = await Loan.create({
    borrowerId,
    fullName,
    pan: pan.toUpperCase(),
    dob: new Date(dob),
    monthlySalary,
    employmentMode,
    status: LoanStatus.DRAFT,
  });

  sendResponse(res, 201, true, 'Personal details saved. BRE check passed.', { loan });
});

/**
 * POST /api/loans/apply
 * Step 3: Apply for loan (DRAFT → APPLIED)
 */
export const applyLoan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { loanId, loanAmount, tenureDays } = req.body;
  const borrowerId = req.user?.userId;

  const loan = await Loan.findOne({ _id: loanId, borrowerId });
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.status !== LoanStatus.DRAFT) {
    throw new AppError(`Cannot apply. Current status: ${loan.status}`, 400);
  }

  if (!loan.salarySlipUrl) {
    throw new AppError('Please upload salary slip before applying', 400);
  }

  // Calculate loan details
  const loanDetails = calculateLoanDetails(loanAmount, tenureDays);

  loan.loanAmount = loanAmount;
  loan.tenureDays = tenureDays;
  loan.interestRate = loanDetails.interestRate;
  loan.interestAmount = loanDetails.interestAmount;
  loan.totalRepayment = loanDetails.totalRepayment;
  loan.outstandingAmount = loanDetails.totalRepayment;
  loan.status = LoanStatus.APPLIED;

  await loan.save();

  sendResponse(res, 200, true, 'Loan application submitted successfully', { loan });
});

/**
 * GET /api/loans/my-loans
 * Get all loans for current borrower
 */
export const getMyLoans = asyncHandler(async (req: AuthRequest, res: Response) => {
  const borrowerId = req.user?.userId;
  const loans = await Loan.find({ borrowerId }).sort({ createdAt: -1 });
  sendResponse(res, 200, true, 'Loans fetched', { loans });
});

/**
 * GET /api/loans/:id
 * Get single loan details
 */
export const getLoanById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const loan = await Loan.findById(req.params.id).populate('borrowerId', 'fullName email phoneNumber');
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }
  sendResponse(res, 200, true, 'Loan fetched', { loan });
});

// ==================== SANCTION APIs ====================

/**
 * GET /api/sanction/loans
 * Get all loans with APPLIED status
 */
export const getSanctionLoans = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const loans = await Loan.find({ status: LoanStatus.APPLIED })
    .populate('borrowerId', 'fullName email phoneNumber')
    .sort({ createdAt: -1 });
  sendResponse(res, 200, true, 'Sanction loans fetched', { loans });
});

/**
 * PATCH /api/sanction/:loanId/approve
 * Approve loan (APPLIED → SANCTIONED)
 */
export const approveLoan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { loanId } = req.params;
  const { remarks } = req.body;

  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.status !== LoanStatus.APPLIED) {
    throw new AppError(`Cannot approve. Current status: ${loan.status}`, 400);
  }

  // Validate transition
  if (!VALID_TRANSITIONS[loan.status]?.includes(LoanStatus.SANCTIONED)) {
    throw new AppError('Invalid status transition', 400);
  }

  loan.status = LoanStatus.SANCTIONED;
  loan.sanctionRemarks = remarks || '';
  await loan.save();

  sendResponse(res, 200, true, 'Loan sanctioned successfully', { loan });
});

/**
 * PATCH /api/sanction/:loanId/reject
 * Reject loan (APPLIED → REJECTED)
 */
export const rejectLoan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { loanId } = req.params;
  const { reason } = req.body;

  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.status !== LoanStatus.APPLIED) {
    throw new AppError(`Cannot reject. Current status: ${loan.status}`, 400);
  }

  loan.status = LoanStatus.REJECTED;
  loan.rejectionReason = reason;
  await loan.save();

  sendResponse(res, 200, true, 'Loan rejected', { loan });
});

// ==================== DISBURSEMENT APIs ====================

/**
 * GET /api/disbursement/loans
 * Get all sanctioned loans
 */
export const getDisbursementLoans = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const loans = await Loan.find({ status: LoanStatus.SANCTIONED })
    .populate('borrowerId', 'fullName email phoneNumber')
    .sort({ createdAt: -1 });
  sendResponse(res, 200, true, 'Disbursement loans fetched', { loans });
});

/**
 * PATCH /api/disbursement/:loanId/disburse
 * Disburse loan (SANCTIONED → DISBURSED)
 */
export const disburseLoan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { loanId } = req.params;

  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.status !== LoanStatus.SANCTIONED) {
    throw new AppError(`Cannot disburse. Current status: ${loan.status}`, 400);
  }

  loan.status = LoanStatus.DISBURSED;
  loan.disbursedAt = new Date();
  await loan.save();

  sendResponse(res, 200, true, 'Loan disbursed successfully', { loan });
});

// ==================== COLLECTION APIs ====================

/**
 * GET /api/collection/loans
 * Get all disbursed loans
 */
export const getCollectionLoans = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const loans = await Loan.find({ status: { $in: [LoanStatus.DISBURSED, LoanStatus.CLOSED] } })
    .populate('borrowerId', 'fullName email phoneNumber')
    .sort({ createdAt: -1 });
  sendResponse(res, 200, true, 'Collection loans fetched', { loans });
});
