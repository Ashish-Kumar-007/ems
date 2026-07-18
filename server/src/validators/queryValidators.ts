import { z } from 'zod';
import { EmployeeStatus, Role } from '@prisma/client';

export const queryParamsSchema = z.object({
  search: z.string().optional(),
  department: z.string().uuid().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  sortBy: z.enum(['firstName', 'lastName', 'joiningDate', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type QueryParamsInput = z.infer<typeof queryParamsSchema>;
