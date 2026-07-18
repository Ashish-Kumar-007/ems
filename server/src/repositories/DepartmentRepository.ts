import { prisma } from '../config/database';
import { Department, Prisma } from '@prisma/client';

/**
 * Repository Pattern: Abstracts data access for Department entity.
 */
export class DepartmentRepository {
  async findAll(): Promise<Department[]> {
    return prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Department | null> {
    return prisma.department.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Department | null> {
    return prisma.department.findUnique({ where: { name } });
  }

  async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return prisma.department.create({ data });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput): Promise<Department> {
    return prisma.department.update({ where: { id }, data });
  }

  async findOrCreate(name: string): Promise<Department> {
    const existing = await this.findByName(name);
    if (existing) return existing;
    return this.create({ name });
  }
}

export const departmentRepository = new DepartmentRepository();
