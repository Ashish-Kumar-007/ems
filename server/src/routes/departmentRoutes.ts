import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { departmentRepository } from '../repositories/DepartmentRepository';

const router = Router();

router.use(authMiddleware);

// GET /api/departments
router.get('/', async (req, res, next) => {
  try {
    const departments = await departmentRepository.findAll();
    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
