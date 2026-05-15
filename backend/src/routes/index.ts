import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import loanRoutes from '../modules/loans/loan.routes';
import paymentRoutes from '../modules/payments/payment.routes';
import uploadRoutes from '../modules/uploads/upload.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/loans', loanRoutes);
router.use('/collection', paymentRoutes);
router.use('/uploads', uploadRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
