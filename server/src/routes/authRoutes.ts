import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { loginSchema } from '../validators/authValidators';

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res, next) =>
  authController.logout(req, res, next)
);

// POST /api/auth/refresh
router.post('/refresh', (req, res, next) =>
  authController.refresh(req, res, next)
);

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res, next) =>
  authController.me(req, res, next)
);

export default router;
