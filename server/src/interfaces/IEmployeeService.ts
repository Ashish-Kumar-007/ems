import { Employee, EmployeeStatus, Role } from '@prisma/client';
import { CsvParseResult } from '../utils/csvParser';

/**
 * Dependency Inversion Principle (DIP):
 * Controllers depend on this abstraction, not on the concrete EmployeeService.
 */

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  designation: string;
  salary: number;
  joiningDate: Date;
  status?: EmployeeStatus;
  role?: Role;
  managerId?: string;
  profileImage?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  departmentId?: string;
  designation?: string;
  salary?: number;
  joiningDate?: Date;
  status?: EmployeeStatus;
  role?: Role;
  managerId?: string;
  profileImage?: string;
}

export interface EmployeeQueryParams {
  search?: string;
  department?: string;
  role?: Role;
  status?: EmployeeStatus;
  sortBy?: 'firstName' | 'lastName' | 'joiningDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type EmployeeWithRelations = Employee & {
  user: { email: string; role: Role };
  department: { id: string; name: string };
  manager?: { id: string; firstName: string; lastName: string } | null;
  _count?: { reportees: number };
};

export interface IEmployeeService {
  /** Create a new employee and associated user account */
  create(dto: CreateEmployeeDto, performedByUserId: string): Promise<EmployeeWithRelations>;

  /** Get all employees with search, filter, sort, pagination */
  findAll(params: EmployeeQueryParams): Promise<PaginatedResult<EmployeeWithRelations>>;

  /** Get a single employee by ID */
  findById(id: string): Promise<EmployeeWithRelations | null>;

  /** Get a single employee by user ID */
  findByUserId(userId: string): Promise<EmployeeWithRelations | null>;

  /** Update an employee */
  update(id: string, dto: UpdateEmployeeDto, performedByUserId: string): Promise<EmployeeWithRelations>;

  /** Soft delete an employee */
  softDelete(id: string, performedByUserId: string): Promise<void>;

  /** Restore a soft-deleted employee */
  restore(id: string, performedByUserId: string): Promise<EmployeeWithRelations>;

  /** Import employees from CSV buffer */
  importCsv(buffer: Buffer, performedByUserId: string): Promise<CsvParseResult & { created: number }>;

  /** Upload and set an employee's avatar */
  uploadAvatar(id: string, buffer: Buffer, performedByUserId: string): Promise<string>;
}
