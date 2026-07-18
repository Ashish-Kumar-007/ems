import { prisma } from '../config/database';
import { Employee, Prisma } from '@prisma/client';
import { EmployeeQueryParams, EmployeeWithRelations, PaginatedResult } from '../interfaces/IEmployeeService';

/**
 * Standard includes for employee queries – consistent relation loading.
 */
const employeeIncludes = {
  user: { select: { email: true, role: true } },
  department: { select: { id: true, name: true } },
  manager: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { reportees: true } },
} satisfies Prisma.EmployeeInclude;

/**
 * Repository Pattern: Abstracts data access for Employee entity.
 * Builder Pattern: buildWhereClause constructs complex queries.
 * Single Responsibility: Only handles Employee persistence operations.
 */
export class EmployeeRepository {
  /**
   * Builder Pattern: Constructs a Prisma where clause from query params.
   */
  private buildWhereClause(params: EmployeeQueryParams): Prisma.EmployeeWhereInput {
    const where: Prisma.EmployeeWhereInput = {
      isDeleted: false, // Always exclude soft-deleted
    };

    // Search by name or email (via user relation)
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
        { employeeId: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // Filter by department
    if (params.department) {
      where.departmentId = params.department;
    }

    // Filter by role (via user relation)
    if (params.role) {
      where.user = { ...where.user as object, role: params.role };
    }

    // Filter by status
    if (params.status) {
      where.status = params.status;
    }

    return where;
  }

  /**
   * Find all employees with search, filter, sort, and pagination.
   */
  async findAll(params: EmployeeQueryParams): Promise<PaginatedResult<EmployeeWithRelations>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(params);

    // Build orderBy
    const orderBy: Prisma.EmployeeOrderByWithRelationInput = {};
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: employeeIncludes,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as unknown as EmployeeWithRelations[],
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<EmployeeWithRelations | null> {
    const employee = await prisma.employee.findFirst({
      where: { id, isDeleted: false },
      include: employeeIncludes,
    });
    return employee as unknown as EmployeeWithRelations | null;
  }

  async findByUserId(userId: string): Promise<EmployeeWithRelations | null> {
    const employee = await prisma.employee.findFirst({
      where: { userId, isDeleted: false },
      include: employeeIncludes,
    });
    return employee as unknown as EmployeeWithRelations | null;
  }

  async findByEmployeeId(employeeId: string): Promise<Employee | null> {
    return prisma.employee.findUnique({ where: { employeeId } });
  }

  async create(
    data: Prisma.EmployeeCreateInput
  ): Promise<EmployeeWithRelations> {
    const employee = await prisma.employee.create({
      data,
      include: employeeIncludes,
    });
    return employee as unknown as EmployeeWithRelations;
  }

  async update(
    id: string,
    data: Prisma.EmployeeUpdateInput
  ): Promise<EmployeeWithRelations> {
    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: employeeIncludes,
    });
    return employee as unknown as EmployeeWithRelations;
  }

  async softDelete(id: string): Promise<void> {
    await prisma.employee.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<EmployeeWithRelations> {
    const employee = await prisma.employee.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
      include: employeeIncludes,
    });
    return employee as unknown as EmployeeWithRelations;
  }

  /**
   * Find all employees for org tree (non-deleted only).
   */
  async findAllForOrgTree(): Promise<EmployeeWithRelations[]> {
    const employees = await prisma.employee.findMany({
      where: { isDeleted: false },
      include: {
        ...employeeIncludes,
        reportees: {
          where: { isDeleted: false },
          select: { id: true },
        },
      },
    });
    return employees as unknown as EmployeeWithRelations[];
  }

  /**
   * Find direct reportees of a manager.
   */
  async findReportees(managerId: string): Promise<EmployeeWithRelations[]> {
    const employees = await prisma.employee.findMany({
      where: { managerId, isDeleted: false },
      include: employeeIncludes,
    });
    return employees as unknown as EmployeeWithRelations[];
  }

  /**
   * Get the next employee ID sequence number.
   */
  async getNextEmployeeId(): Promise<string> {
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { employeeId: true },
    });

    if (!lastEmployee) return 'EMP-001';

    const lastNum = parseInt(lastEmployee.employeeId.replace('EMP-', ''), 10);
    return `EMP-${String(lastNum + 1).padStart(3, '0')}`;
  }

  /**
   * Get dashboard statistics.
   */
  async getDashboardStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    departmentCount: number;
    departmentDistribution: Array<{ name: string; count: number }>;
    roleDistribution: Array<{ role: string; count: number }>;
    recentJoiners: EmployeeWithRelations[];
    monthlyJoinTrend: Array<{ month: string; count: number }>;
  }> {
    const [total, active, inactive, departmentCount, departmentDist, roleDist, recentJoiners] =
      await Promise.all([
        prisma.employee.count({ where: { isDeleted: false } }),
        prisma.employee.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
        prisma.employee.count({ where: { isDeleted: false, status: 'INACTIVE' } }),
        prisma.department.count(),
        prisma.department.findMany({
          select: {
            name: true,
            _count: { select: { employees: { where: { isDeleted: false } } } },
          },
        }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
          where: { employee: { isDeleted: false } },
        }),
        prisma.employee.findMany({
          where: { isDeleted: false },
          include: employeeIncludes,
          orderBy: { joiningDate: 'desc' },
          take: 5,
        }),
      ]);

    // Calculate monthly join trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyJoins = await prisma.employee.groupBy({
      by: ['joiningDate'],
      where: {
        isDeleted: false,
        joiningDate: { gte: sixMonthsAgo },
      },
      _count: { id: true },
    });

    // Aggregate by month
    const monthlyMap = new Map<string, number>();
    monthlyJoins.forEach((record) => {
      const date = new Date(record.joiningDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + record._count.id);
    });

    const monthlyJoinTrend = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      total,
      active,
      inactive,
      departmentCount,
      departmentDistribution: departmentDist.map((d) => ({
        name: d.name,
        count: d._count.employees,
      })),
      roleDistribution: roleDist.map((r) => ({
        role: r.role,
        count: r._count.role,
      })),
      recentJoiners: recentJoiners as unknown as EmployeeWithRelations[],
      monthlyJoinTrend,
    };
  }
}

export const employeeRepository = new EmployeeRepository();
