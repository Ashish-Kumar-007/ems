import { prisma } from '../config/database';
import { Role } from '@prisma/client';
import { employeeRepository } from '../repositories/EmployeeRepository';
import { departmentRepository } from '../repositories/DepartmentRepository';
import { authService } from './AuthService';
import {
  IEmployeeService,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryParams,
  PaginatedResult,
  EmployeeWithRelations,
} from '../interfaces/IEmployeeService';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../utils/AppError';
import { logger } from '../utils/logger';
import { parseCsvBuffer, CsvParseResult } from '../utils/csvParser';

/**
 * EmployeeService: Business logic for employee management.
 *
 * Single Responsibility: Handles employee CRUD business rules.
 * Dependency Inversion: Implements IEmployeeService interface.
 */
export class EmployeeService implements IEmployeeService {
  /**
   * Create a new employee with an associated user account.
   * Uses a Prisma transaction to ensure atomicity.
   */
  async create(
    dto: CreateEmployeeDto,
    performedByUserId: string
  ): Promise<EmployeeWithRelations> {
    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictError(`Email ${dto.email} is already in use`);
    }

    // Verify department exists
    const department = await departmentRepository.findById(dto.departmentId);
    if (!department) {
      throw new NotFoundError(`Department not found`);
    }

    // Verify manager exists if provided
    if (dto.managerId) {
      const manager = await employeeRepository.findById(dto.managerId);
      if (!manager) {
        throw new NotFoundError(`Manager not found`);
      }
    }

    // Generate employee ID and default password
    const employeeId = await employeeRepository.getNextEmployeeId();
    const defaultPassword = await authService.hashPassword('Password@123');

    // Transaction: Create User + Employee atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: defaultPassword,
          role: dto.role || Role.EMPLOYEE,
        },
      });

      const employee = await tx.employee.create({
        data: {
          employeeId,
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          departmentId: dto.departmentId,
          designation: dto.designation,
          salary: dto.salary,
          joiningDate: new Date(dto.joiningDate),
          status: dto.status || 'ACTIVE',
          managerId: dto.managerId || null,
          profileImage: dto.profileImage || null,
        },
        include: {
          user: { select: { email: true, role: true } },
          department: { select: { id: true, name: true } },
          manager: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { reportees: true } },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'Employee',
          entityId: employee.id,
          performedById: performedByUserId,
          targetEmployeeId: employee.id,
          newValues: {
            employeeId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            department: department.name,
          },
        },
      });

      return employee;
    });

    logger.info(`Employee created: ${result.employeeId} by user ${performedByUserId}`);
    return result as unknown as EmployeeWithRelations;
  }

  /**
   * Get all employees with search, filter, sort, pagination.
   */
  async findAll(params: EmployeeQueryParams): Promise<PaginatedResult<EmployeeWithRelations>> {
    return employeeRepository.findAll(params);
  }

  /**
   * Get a single employee by ID.
   */
  async findById(id: string): Promise<EmployeeWithRelations | null> {
    return employeeRepository.findById(id);
  }

  /**
   * Get a single employee by user ID.
   */
  async findByUserId(userId: string): Promise<EmployeeWithRelations | null> {
    return employeeRepository.findByUserId(userId);
  }

  /**
   * Update an employee.
   * Only updates allowed fields based on what's provided.
   */
  async update(
    id: string,
    dto: UpdateEmployeeDto,
    performedByUserId: string
  ): Promise<EmployeeWithRelations> {
    const existing = await employeeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Employee not found');
    }

    // If changing department, verify it exists
    if (dto.departmentId) {
      const department = await departmentRepository.findById(dto.departmentId);
      if (!department) {
        throw new NotFoundError('Department not found');
      }
    }

    // Build update data (only include provided fields)
    const updateData: Record<string, any> = {};
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'departmentId',
      'designation', 'salary', 'joiningDate', 'status',
      'managerId', 'profileImage',
    ];

    for (const field of allowedFields) {
      if ((dto as any)[field] !== undefined) {
        if (field === 'joiningDate') {
          updateData[field] = new Date((dto as any)[field]);
        } else {
          updateData[field] = (dto as any)[field];
        }
      }
    }

    // If role is being changed, update the User record too
    if (dto.role) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { role: dto.role },
      });
    }

    const updated = await employeeRepository.update(id, updateData);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Employee',
        entityId: id,
        performedById: performedByUserId,
        targetEmployeeId: id,
        previousValues: existing as any,
        newValues: updateData,
      },
    });

    logger.info(`Employee updated: ${id} by user ${performedByUserId}`);
    return updated;
  }

  /**
   * Soft delete an employee (sets isDeleted=true).
   * Also deactivates the associated user account.
   */
  async softDelete(id: string, performedByUserId: string): Promise<void> {
    const existing = await employeeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Employee not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' },
      });

      await tx.user.update({
        where: { id: existing.userId },
        data: { isActive: false },
      });

      await tx.auditLog.create({
        data: {
          action: 'DELETE',
          entityType: 'Employee',
          entityId: id,
          performedById: performedByUserId,
          targetEmployeeId: id,
          previousValues: { status: existing.status },
        },
      });
    });

    logger.info(`Employee soft deleted: ${id} by user ${performedByUserId}`);
  }

  /**
   * Restore a soft-deleted employee.
   */
  async restore(id: string, performedByUserId: string): Promise<EmployeeWithRelations> {
    const existing = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      throw new NotFoundError('Employee not found');
    }

    if (!existing.isDeleted) {
      throw new BadRequestError('Employee is not deleted');
    }

    await prisma.user.update({
      where: { id: existing.userId },
      data: { isActive: true },
    });

    const restored = await employeeRepository.restore(id);

    await prisma.auditLog.create({
      data: {
        action: 'RESTORE',
        entityType: 'Employee',
        entityId: id,
        performedById: performedByUserId,
        targetEmployeeId: id,
      },
    });

    logger.info(`Employee restored: ${id} by user ${performedByUserId}`);
    return restored;
  }

  /**
   * Import employees from CSV buffer.
   * Creates departments on-the-fly if they don't exist.
   */
  async importCsv(
    buffer: Buffer,
    performedByUserId: string
  ): Promise<CsvParseResult & { created: number }> {
    const parseResult = await parseCsvBuffer(buffer);
    let created = 0;

    for (const row of parseResult.validRows) {
      try {
        // Find or create department
        const department = await departmentRepository.findOrCreate(row.department);

        await this.create(
          {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone,
            departmentId: department.id,
            designation: row.designation,
            salary: typeof row.salary === 'string' ? parseFloat(row.salary) : row.salary,
            joiningDate: new Date(row.joiningDate),
            status: row.status as any || 'ACTIVE',
          },
          performedByUserId
        );
        created++;
      } catch (error: any) {
        parseResult.errors.push({
          row: parseResult.validRows.indexOf(row) + 1,
          field: 'general',
          message: error.message,
        });
      }
    }

    logger.info(`CSV import: ${created}/${parseResult.totalRows} employees created`);
    return { ...parseResult, created };
  }
}

export const employeeService = new EmployeeService();
