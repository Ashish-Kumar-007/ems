import { EmployeeWithRelations } from './IEmployeeService';

/**
 * Dependency Inversion Principle (DIP):
 * Controllers depend on this abstraction for org hierarchy operations.
 */

export interface OrgTreeNode {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  profileImage?: string | null;
  email: string;
  children: OrgTreeNode[];
}

export interface IOrgService {
  /** Build the full organizational tree */
  getOrgTree(): Promise<OrgTreeNode[]>;

  /** Get direct reportees of an employee */
  getReportees(employeeId: string): Promise<EmployeeWithRelations[]>;

  /** Assign a reporting manager to an employee */
  assignManager(
    employeeId: string,
    managerId: string | null,
    performedByUserId: string
  ): Promise<EmployeeWithRelations>;

  /** Check if assigning managerId would create a circular reference */
  wouldCreateCircularReference(employeeId: string, managerId: string): Promise<boolean>;
}
