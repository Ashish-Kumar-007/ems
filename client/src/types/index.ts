export interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  profileImage: string | null;
  departmentId: string;
  managerId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: { email: string; role: string };
  department: { id: string; name: string };
  manager?: { id: string; firstName: string; lastName: string } | null;
  _count?: { reportees: number };
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface OrgTreeNode {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  profileImage: string | null;
  email: string;
  children: OrgTreeNode[];
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  departmentCount: number;
  departmentDistribution: Array<{ name: string; count: number }>;
  roleDistribution: Array<{ role: string; count: number }>;
  recentJoiners: Employee[];
  monthlyJoinTrend: Array<{ month: string; count: number }>;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationInfo;
}

export interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
