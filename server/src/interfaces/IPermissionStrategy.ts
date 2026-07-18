import { Role } from '@prisma/client';

/**
 * Interface Segregation Principle (ISP):
 * IPermissionStrategy exposes only the methods needed by the RBAC middleware.
 *
 * Strategy Pattern: Each role implements this interface with role-specific logic.
 */
export interface IPermissionStrategy {
  /** Whether this role can create new employees */
  canCreate(): boolean;

  /** Whether this role can read employee data (param: is it their own record?) */
  canRead(isOwnRecord: boolean): boolean;

  /** Whether this role can update employee data */
  canUpdate(isOwnRecord: boolean): boolean;

  /** Whether this role can delete employees */
  canDelete(): boolean;

  /** Whether this role can assign roles to employees */
  canAssignRole(targetRole: Role): boolean;

  /** Whether this role can assign/change managers */
  canAssignManager(): boolean;

  /** Whether this role can view the organization tree */
  canViewOrgTree(): boolean;

  /** Whether this role can import employees via CSV */
  canImportCsv(): boolean;

  /** Whether this role can view dashboard analytics */
  canViewDashboard(): boolean;

  /** Returns the list of fields this role is allowed to update */
  getAllowedUpdateFields(isOwnRecord: boolean): string[];

  /** Returns the list of fields this role is allowed to view */
  getAllowedViewFields(isOwnRecord: boolean): string[];
}
