import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import { AuthRequest, LoanStatus } from '../../types';
import { Loan } from '../loans/loan.model';
import { asyncHandler, AppError, sendResponse } from '../../utils/helpers';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/constants';

// Multer configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `salary-slip-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, JPG, and PNG files are allowed', 400) as any);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * POST /api/uploads/salary-slip
 * Upload salary slip for a loan
 */
export const uploadSalarySlip = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { loanId } = req.body;
  const borrowerId = req.user?.userId;

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const loan = await Loan.findOne({ _id: loanId, borrowerId });
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  if (loan.status !== LoanStatus.DRAFT) {
    throw new AppError('Salary slip can only be uploaded for DRAFT loans', 400);
  }

  // Save file path
  loan.salarySlipUrl = `/uploads/${req.file.filename}`;
  await loan.save();

  sendResponse(res, 200, true, 'Salary slip uploaded successfully', {
    salarySlipUrl: loan.salarySlipUrl,
    loan: {
      id: loan._id,
      status: loan.status,
    },
  });
});
