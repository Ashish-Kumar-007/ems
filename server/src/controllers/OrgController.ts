import { Request, Response, NextFunction } from 'express';
import { orgService } from '../services/OrgService';

/**
 * OrgController: Handles organizational hierarchy endpoints.
 */
export class OrgController {
  /**
   * GET /api/organization/tree
   */
  async getTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = await orgService.getOrgTree();

      res.status(200).json({
        success: true,
        data: tree,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/employees/:id/reportees
   */
  async getReportees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reportees = await orgService.getReportees(id);

      res.status(200).json({
        success: true,
        data: reportees,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/employees/:id/manager
   */
  async assignManager(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { managerId } = req.body;

      const employee = await orgService.assignManager(id, managerId, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Manager assigned successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orgController = new OrgController();
