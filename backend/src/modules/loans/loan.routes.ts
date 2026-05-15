import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '../../types';
import {
  personalDetailsSchema,
  loanApplySchema,
  sanctionSchema,
  rejectSchema,
} from './loan.validation';
import {
  savePersonalDetails,
  applyLoan,
  getMyLoans,
  getLoanById,
  getSanctionLoans,
  approveLoan,
  rejectLoan,
  getDisbursementLoans,
  disburseLoan,
  getCollectionLoans,
} from './loan.controller';

const router = Router();

// ==================== BORROWER ROUTES ====================
router.post(
  '/personal-details',
  authMiddleware,
  roleMiddleware([Role.BORROWER]),
  validate(personalDetailsSchema),
  savePersonalDetails
);

router.post(
  '/apply',
  authMiddleware,
  roleMiddleware([Role.BORROWER]),
  validate(loanApplySchema),
  applyLoan
);

router.get('/my-loans', authMiddleware, roleMiddleware([Role.BORROWER]), getMyLoans);

router.get('/:id', authMiddleware, getLoanById);

// ==================== SANCTION ROUTES ====================
router.get(
  '/sanction/list',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.SANCTION]),
  getSanctionLoans
);

router.patch(
  '/sanction/:loanId/approve',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.SANCTION]),
  validate(sanctionSchema),
  approveLoan
);

router.patch(
  '/sanction/:loanId/reject',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.SANCTION]),
  validate(rejectSchema),
  rejectLoan
);

// ==================== DISBURSEMENT ROUTES ====================
router.get(
  '/disbursement/list',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.DISBURSEMENT]),
  getDisbursementLoans
);

router.patch(
  '/disbursement/:loanId/disburse',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.DISBURSEMENT]),
  disburseLoan
);

// ==================== COLLECTION ROUTES ====================
router.get(
  '/collection/list',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.COLLECTION]),
  getCollectionLoans
);

export default router;
