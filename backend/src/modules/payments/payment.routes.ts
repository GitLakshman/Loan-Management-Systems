import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types';
import { paymentSchema } from '../loans/loan.validation';
import { recordPayment, getLoanPayments } from './payment.controller';

const router = Router();

router.post(
  '/:loanId/payment',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.COLLECTION]),
  validate(paymentSchema),
  recordPayment
);

router.get(
  '/:loanId/payments',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.COLLECTION]),
  getLoanPayments
);

export default router;
