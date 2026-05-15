import { Router } from 'express';
import { register, login, getMe, logout } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

export default router;
