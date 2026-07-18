import { Role } from '@prisma/client';
import { IPermissionStrategy } from '../interfaces/IPermissionStrategy';

/**
 * Employee Strategy – View/edit own profile only with limited fields.
 *
 * Strategy Pattern: Encapsulates Employee permission logic.
 */
export class EmployeeStrategy implements IPermissionStrategy {
  canCreate(): boolean {
    return false;
  }

  canRead(isOwnRecord: boolean): boolean {
    return isOwnRecord; // Can only view own profile
  }

  canUpdate(isOwnRecord: boolean): boolean {
    return isOwnRecord; // Can only edit own profile
  }

  canDelete(): boolean {
    return false;
  }

  canAssignRole(_targetRole: Role): boolean {
    return false;
  }

  canAssignManager(): boolean {
    return false;
  }

  canViewOrgTree(): boolean {
    return false;
  }

  canImportCsv(): boolean {
    return false;
  }

  canViewDashboard(): boolean {
    return false;
  }

  getAllowedUpdateFields(isOwnRecord: boolean): string[] {
    if (!isOwnRecord) return [];
    // Employee can only update limited personal fields
    return ['firstName', 'lastName', 'phone', 'profileImage'];
  }

  getAllowedViewFields(isOwnRecord: boolean): string[] {
    if (!isOwnRecord) return [];
    return [
      'id', 'employeeId', 'firstName', 'lastName', 'phone',
      'departmentId', 'department', 'designation',
      'joiningDate', 'status', 'role', 'managerId', 'manager',
      'profileImage', 'user',
    ];
    // Note: salary is excluded from Employee's view
  }
}
