import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import { Role } from '../../types';
import { getDashboardStats } from './dashboard.controller';

const router = Router();

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.SALES, Role.SANCTION, Role.DISBURSEMENT, Role.COLLECTION]),
  getDashboardStats
);

export default router;
