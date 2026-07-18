import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { employeeService } from '../services/EmployeeService';
import { PermissionStrategyFactory } from '../strategies/PermissionStrategyFactory';
import { ForbiddenError, NotFoundError } from '../utils/AppError';

/**
 * EmployeeController: Thin controller for employee CRUD.
 * Uses Strategy Pattern via PermissionStrategyFactory for field-level access control.
 */
export class EmployeeController {
  /**
   * GET /api/employees
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await employeeService.findAll(req.query as any);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/employees/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await employeeService.findById(id);

      if (!employee) {
        throw new NotFoundError('Employee not found');
      }

      // Check read permission
      const isOwnRecord = employee.userId === req.user!.userId;
      const strategy = PermissionStrategyFactory.getStrategy(req.user!.role as Role);

      if (!strategy.canRead(isOwnRecord)) {
        throw new ForbiddenError('You do not have permission to view this employee');
      }

      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/employees
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.create(req.body, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/employees/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Verify employee exists and check permissions
      const existing = await employeeService.findById(id);
      if (!existing) {
        throw new NotFoundError('Employee not found');
      }

      const isOwnRecord = existing.userId === req.user!.userId;
      const strategy = PermissionStrategyFactory.getStrategy(req.user!.role as Role);

      if (!strategy.canUpdate(isOwnRecord)) {
        throw new ForbiddenError('You do not have permission to update this employee');
      }

      // Filter update data to only allowed fields
      const allowedFields = strategy.getAllowedUpdateFields(isOwnRecord);
      const filteredData: Record<string, any> = {};

      for (const [key, value] of Object.entries(req.body)) {
        if (allowedFields.includes(key)) {
          filteredData[key] = value;
        }
      }

      // Check role assignment permission
      if (req.body.role && !strategy.canAssignRole(req.body.role)) {
        throw new ForbiddenError(`You cannot assign the role: ${req.body.role}`);
      }

      const employee = await employeeService.update(id, filteredData, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/employees/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await employeeService.softDelete(id, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/employees/import
   */
  async importCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'CSV file is required',
        });
        return;
      }

      const result = await employeeService.importCsv(
        req.file.buffer,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        message: `${result.created} employees imported successfully`,
        data: {
          totalRows: result.totalRows,
          created: result.created,
          errors: result.errors,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/employees/:id/avatar
   */
  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Profile image is required',
        });
        return;
      }

      const imageUrl = await employeeService.uploadAvatar(
        req.params.id,
        req.file.buffer,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          profileImage: imageUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
