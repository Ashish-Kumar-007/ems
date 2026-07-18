import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { PermissionStrategyFactory } from '../strategies/PermissionStrategyFactory';
import { ForbiddenError } from '../utils/AppError';

type PermissionCheck =
  | 'canCreate'
  | 'canDelete'
  | 'canViewOrgTree'
  | 'canImportCsv'
  | 'canViewDashboard'
  | 'canAssignManager';

/**
 * RBAC Middleware (Chain of Responsibility + Strategy Pattern)
 *
 * Uses the Strategy Pattern to check permissions based on the user's role.
 * The appropriate strategy is resolved via PermissionStrategyFactory.
 */

/**
 * Checks if the user has a specific permission.
 */
export const requirePermission = (permission: PermissionCheck) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const strategy = PermissionStrategyFactory.getStrategy(req.user.role as Role);
      const hasPermission = strategy[permission]();

      if (!hasPermission) {
        throw new ForbiddenError(
          `Insufficient permissions: ${permission} not allowed for role ${req.user.role}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Restricts access to specific roles only.
 */
export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      if (!roles.includes(req.user.role as Role)) {
        throw new ForbiddenError(
          `Access denied. Required roles: ${roles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
