import { z } from 'zod';
import { EmployeeStatus, Role } from '@prisma/client';

const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

export const createEmployeeSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .trim(),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  phone: z
    .string({ required_error: 'Phone is required' })
    .regex(phoneRegex, 'Invalid phone number format'),
  departmentId: z
    .string({ required_error: 'Department is required' })
    .uuid('Invalid department ID'),
  designation: z
    .string({ required_error: 'Designation is required' })
    .min(2, 'Designation must be at least 2 characters')
    .max(100, 'Designation must not exceed 100 characters')
    .trim(),
  salary: z
    .number({ required_error: 'Salary is required' })
    .positive('Salary must be a positive number')
    .max(99999999.99, 'Salary exceeds maximum value'),
  joiningDate: z
    .string({ required_error: 'Joining date is required' })
    .datetime({ message: 'Invalid date format' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')),
  status: z.nativeEnum(EmployeeStatus).optional().default('ACTIVE'),
  role: z.nativeEnum(Role).optional().default('EMPLOYEE'),
  managerId: z.string().uuid('Invalid manager ID').optional().nullable(),
  profileImage: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional(),
  departmentId: z
    .string()
    .uuid('Invalid department ID')
    .optional(),
  designation: z
    .string()
    .min(2, 'Designation must be at least 2 characters')
    .max(100, 'Designation must not exceed 100 characters')
    .trim()
    .optional(),
  salary: z
    .number()
    .positive('Salary must be a positive number')
    .max(99999999.99, 'Salary exceeds maximum value')
    .optional(),
  joiningDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'))
    .optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  role: z.nativeEnum(Role).optional(),
  managerId: z.string().uuid('Invalid manager ID').optional().nullable(),
  profileImage: z.string().optional(),
});

export const assignManagerSchema = z.object({
  managerId: z.string().uuid('Invalid manager ID').nullable(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type AssignManagerInput = z.infer<typeof assignManagerSchema>;
