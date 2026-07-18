import { prisma } from '../config/database';
import { employeeRepository } from '../repositories/EmployeeRepository';
import { IOrgService, OrgTreeNode } from '../interfaces/IOrgService';
import { EmployeeWithRelations } from '../interfaces/IEmployeeService';
import { NotFoundError, BadRequestError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * OrgService: Business logic for organizational hierarchy.
 *
 * Single Responsibility: Handles org tree, manager assignment, circular reference detection.
 * Uses DFS (Depth-First Search) for circular reference detection.
 */
export class OrgService implements IOrgService {
  /**
   * Build the full organizational tree.
   * Fetches all employees and constructs a tree structure in-memory.
   */
  async getOrgTree(): Promise<OrgTreeNode[]> {
    const employees = await employeeRepository.findAllForOrgTree();

    // Build lookup map
    const employeeMap = new Map<string, OrgTreeNode>();
    const roots: OrgTreeNode[] = [];

    // First pass: create all nodes
    for (const emp of employees) {
      employeeMap.set(emp.id, {
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        designation: emp.designation,
        department: emp.department.name,
        profileImage: emp.profileImage,
        email: emp.user.email,
        children: [],
      });
    }

    // Second pass: build parent-child relationships
    for (const emp of employees) {
      const node = employeeMap.get(emp.id)!;
      if (emp.managerId && employeeMap.has(emp.managerId)) {
        employeeMap.get(emp.managerId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Get direct reportees of an employee.
   */
  async getReportees(employeeId: string): Promise<EmployeeWithRelations[]> {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    return employeeRepository.findReportees(employeeId);
  }

  /**
   * Assign a reporting manager to an employee.
   * Validates against circular references.
   */
  async assignManager(
    employeeId: string,
    managerId: string | null,
    performedByUserId: string
  ): Promise<EmployeeWithRelations> {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // Can't be your own manager
    if (managerId === employeeId) {
      throw new BadRequestError('An employee cannot be their own manager');
    }

    if (managerId) {
      const manager = await employeeRepository.findById(managerId);
      if (!manager) {
        throw new NotFoundError('Manager not found');
      }

      // Check for circular reference
      const wouldBeCircular = await this.wouldCreateCircularReference(employeeId, managerId);
      if (wouldBeCircular) {
        throw new BadRequestError(
          'This assignment would create a circular reporting chain'
        );
      }
    }

    const updated = await employeeRepository.update(employeeId, {
      managerId: managerId,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'ASSIGN_MANAGER',
        entityType: 'Employee',
        entityId: employeeId,
        performedById: performedByUserId,
        targetEmployeeId: employeeId,
        previousValues: { managerId: employee.managerId },
        newValues: { managerId },
      },
    });

    logger.info(`Manager assigned: ${managerId} -> ${employeeId} by ${performedByUserId}`);
    return updated;
  }

  /**
   * Detect circular reference using DFS.
   *
   * Starting from the proposed managerId, walk up the chain.
   * If we encounter employeeId, it would create a cycle.
   */
  async wouldCreateCircularReference(
    employeeId: string,
    managerId: string
  ): Promise<boolean> {
    const visited = new Set<string>();
    let current: string | null = managerId;

    while (current) {
      // If we've reached the employee, it's circular
      if (current === employeeId) {
        return true;
      }

      // If we've already visited this node, we're in a loop (shouldn't happen in valid data)
      if (visited.has(current)) {
        return false;
      }

      visited.add(current);

      // Walk up to the next manager
      const emp = await prisma.employee.findUnique({
        where: { id: current },
        select: { managerId: true },
      });

      current = emp?.managerId || null;
    }

    return false;
  }
}

export const orgService = new OrgService();
