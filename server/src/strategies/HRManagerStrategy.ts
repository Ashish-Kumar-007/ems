import { Role } from '@prisma/client';
import { IPermissionStrategy } from '../interfaces/IPermissionStrategy';

/**
 * HR Manager Strategy – Can Create/Edit/View employees, cannot delete or assign Super Admin.
 *
 * Strategy Pattern: Encapsulates HR Manager permission logic.
 */
export class HRManagerStrategy implements IPermissionStrategy {
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
    return false; // HR cannot delete
  }

  canAssignRole(targetRole: Role): boolean {
    // HR cannot assign SUPER_ADMIN role
    return targetRole !== Role.SUPER_ADMIN;
  }

  canAssignManager(): boolean {
    return false; // Only Super Admin can assign managers
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
    // HR can update most fields except role assignment to Super Admin
    return [
      'firstName', 'lastName', 'phone', 'departmentId',
      'designation', 'salary', 'joiningDate', 'status',
      'profileImage',
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
