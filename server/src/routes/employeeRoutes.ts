import { Router } from 'express';
import { employeeController } from '../controllers/EmployeeController';
import { orgController } from '../controllers/OrgController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePermission, requireRole } from '../middleware/rbacMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createEmployeeSchema, updateEmployeeSchema, assignManagerSchema } from '../validators/employeeValidators';
import { queryParamsSchema } from '../validators/queryValidators';
import { uploadCsv, uploadProfileImage } from '../middleware/uploadMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/employees – List with search/filter/sort/pagination
router.get(
  '/',
  requireRole(Role.SUPER_ADMIN, Role.HR_MANAGER),
  validate(queryParamsSchema, 'query'),
  (req, res, next) => employeeController.getAll(req, res, next)
);

// POST /api/employees – Create
router.post(
  '/',
  requirePermission('canCreate'),
  validate(createEmployeeSchema),
  (req, res, next) => employeeController.create(req, res, next)
);

// POST /api/employees/import – CSV import
router.post(
  '/import',
  requirePermission('canImportCsv'),
  uploadCsv,
  (req, res, next) => employeeController.importCsv(req, res, next)
);

// GET /api/employees/:id – Get by ID
router.get(
  '/:id',
  (req, res, next) => employeeController.getById(req, res, next)
);

// PUT /api/employees/:id – Update
router.put(
  '/:id',
  validate(updateEmployeeSchema),
  (req, res, next) => employeeController.update(req, res, next)
);

// DELETE /api/employees/:id – Soft delete
router.delete(
  '/:id',
  requirePermission('canDelete'),
  (req, res, next) => employeeController.delete(req, res, next)
);

// POST /api/employees/:id/avatar - Upload profile image
router.post(
  '/:id/avatar',
  uploadProfileImage,
  (req, res, next) => employeeController.uploadAvatar(req, res, next)
);

// GET /api/employees/:id/reportees
router.get(
  '/:id/reportees',
  requireRole(Role.SUPER_ADMIN, Role.HR_MANAGER),
  (req, res, next) => orgController.getReportees(req, res, next)
);

// PATCH /api/employees/:id/manager
router.patch(
  '/:id/manager',
  requirePermission('canAssignManager'),
  validate(assignManagerSchema),
  (req, res, next) => orgController.assignManager(req, res, next)
);

export default router;
