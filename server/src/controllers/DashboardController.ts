import { Request, Response, NextFunction } from 'express';
import { employeeRepository } from '../repositories/EmployeeRepository';

/**
 * DashboardController: Provides dashboard statistics.
 */
export class DashboardController {
  /**
   * GET /api/dashboard/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await employeeRepository.getDashboardStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
