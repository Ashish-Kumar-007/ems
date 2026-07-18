import { Role } from '@prisma/client';
import { IPermissionStrategy } from '../interfaces/IPermissionStrategy';
import { SuperAdminStrategy } from './SuperAdminStrategy';
import { HRManagerStrategy } from './HRManagerStrategy';
import { EmployeeStrategy } from './EmployeeStrategy';

/**
 * Factory Pattern: Creates the appropriate permission strategy based on user role.
 *
 * Open/Closed Principle: To add a new role, create a new strategy class
 * and add a case here – no modification to existing strategies needed.
 */
export class PermissionStrategyFactory {
  private static strategies: Map<Role, IPermissionStrategy> = new Map();

  /**
   * Returns the permission strategy for the given role.
   * Strategies are cached (singleton per role) for performance.
   */
  static getStrategy(role: Role): IPermissionStrategy {
    if (!this.strategies.has(role)) {
      switch (role) {
        case Role.SUPER_ADMIN:
          this.strategies.set(role, new SuperAdminStrategy());
          break;
        case Role.HR_MANAGER:
          this.strategies.set(role, new HRManagerStrategy());
          break;
        case Role.EMPLOYEE:
          this.strategies.set(role, new EmployeeStrategy());
          break;
        default:
          throw new Error(`No permission strategy found for role: ${role}`);
      }
    }
    return this.strategies.get(role)!;
  }
}
