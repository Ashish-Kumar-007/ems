import { Router } from 'express';
import { dashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authMiddleware);

// GET /api/dashboard/stats
router.get(
  '/stats',
  requirePermission('canViewDashboard'),
  (req, res, next) => dashboardController.getStats(req, res, next)
);

export default router;
