import { Role } from '@prisma/client';
import { IPermissionStrategy } from '../interfaces/IPermissionStrategy';

/**
 * Super Admin Strategy – Full access to everything.
 *
 * Strategy Pattern: Encapsulates Super Admin permission logic.
 * Liskov Substitution: Can be used wherever IPermissionStrategy is expected.
 */
export class SuperAdminStrategy implements IPermissionStrategy {
  canCreate(): boolean {
    return true;
  }

  canRead(_isOwnRecord: boolean): boolean {
    return true;
  }

  canUpdate(_isOwnRecord: boolean): boolean {
    return true;
  }

  canDelete(): boolean {
    return true;
  }

  canAssignRole(_targetRole: Role): boolean {
    return true; // Super Admin can assign any role, including SUPER_ADMIN
  }

  canAssignManager(): boolean {
    return true;
  }

  canViewOrgTree(): boolean {
    return true;
  }

  canImportCsv(): boolean {
    return true;
  }

  canViewDashboard(): boolean {
    return true;
  }

  getAllowedUpdateFields(_isOwnRecord: boolean): string[] {
    return [
      'firstName', 'lastName', 'phone', 'departmentId',
      'designation', 'salary', 'joiningDate', 'status',
      'role', 'managerId', 'profileImage',
    ];
  }

  getAllowedViewFields(_isOwnRecord: boolean): string[] {
    return [
      'id', 'employeeId', 'firstName', 'lastName', 'phone',
      'departmentId', 'department', 'designation', 'salary',
      'joiningDate', 'status', 'role', 'managerId', 'manager',
      'reportees', 'profileImage', 'createdAt', 'updatedAt',
      'user',
    ];
  }
}
