import { Router } from 'express';
import { orgController } from '../controllers/OrgController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/organization/tree
router.get(
  '/tree',
  requirePermission('canViewOrgTree'),
  (req, res, next) => orgController.getTree(req, res, next)
);

export default router;
