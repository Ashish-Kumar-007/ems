import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Employee } from '@/types';
import { formatDate, getInitials, cn, getRoleBadgeClass, getRoleDisplayName, getStatusBadgeClass } from '@/lib/utils';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface EmployeeRowProps {
  emp: Employee;
  index: number;
  canCreate: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
}

export const EmployeeRow = memo(function EmployeeRow({
  emp,
  index,
  canCreate,
  canDelete,
  onDelete,
}: EmployeeRowProps) {
  const router = useRouter();

  return (
    <tr
      className="table-row cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => router.push(`/employees/${emp.id}`)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {getInitials(emp.firstName, emp.lastName)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {emp.firstName} {emp.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{emp.user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-foreground">{emp.department.name}</span>
        <p className="text-xs text-muted-foreground">{emp.designation}</p>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-sm text-muted-foreground">{formatDate(emp.joiningDate)}</span>
      </td>
      <td className="px-4 py-3 hidden xl:table-cell">
        <span className={cn('badge', getRoleBadgeClass(emp.user.role))}>
          {getRoleDisplayName(emp.user.role)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('badge', getStatusBadgeClass(emp.status))}>
          {emp.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/employees/${emp.id}`)}
            className="btn-ghost p-2 rounded-lg"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canCreate && (
            <button
              onClick={() => router.push(`/employees/${emp.id}/edit`)}
              className="btn-ghost p-2 rounded-lg"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(emp.id)}
              className="btn-ghost p-2 rounded-lg text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});
