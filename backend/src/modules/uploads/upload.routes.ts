import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import { Role } from '../../types';
import { upload, uploadSalarySlip } from './upload.controller';

const router = Router();

router.post(
  '/salary-slip',
  authMiddleware,
  roleMiddleware([Role.BORROWER]),
  upload.single('salarySlip'),
  uploadSalarySlip
);

export default router;
