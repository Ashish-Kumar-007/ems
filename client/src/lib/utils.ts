import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'badge-admin';
    case 'HR_MANAGER':
      return 'badge-hr';
    case 'EMPLOYEE':
      return 'badge-employee';
    default:
      return 'badge-employee';
  }
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'HR_MANAGER':
      return 'HR Manager';
    case 'EMPLOYEE':
      return 'Employee';
    default:
      return role;
  }
}

export function getStatusBadgeClass(status: string): string {
  return status === 'ACTIVE' ? 'badge-active' : 'badge-inactive';
}
