'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { employeeApi } from '@/lib/api';
import { Employee } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import {
  formatDate, formatCurrency, getInitials, cn,
  getRoleBadgeClass, getRoleDisplayName, getStatusBadgeClass,
} from '@/lib/utils';
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone, Building2,
  Calendar, DollarSign, Users, UserCircle, Briefcase,
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reportees, setReportees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes] = await Promise.all([
          employeeApi.getById(id),
        ]);
        setEmployee(empRes.data.data);

        // Fetch reportees if admin/HR
        if (user?.role !== 'EMPLOYEE') {
          try {
            const reporteesRes = await employeeApi.getReportees(id);
            setReportees(reporteesRes.data.data);
          } catch {
            // May not have permission
          }
        }
      } catch (error) {
        console.error('Failed to fetch employee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.role]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeApi.delete(id);
      router.push('/employees');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <UserCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Employee not found</h2>
        <button onClick={() => router.push('/employees')} className="btn-primary mt-4">
          Back to Employees
        </button>
      </div>
    );
  }

  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';
  const canDelete = user?.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="btn-ghost p-2 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => router.push(`/employees/${id}/edit`)}
              className="btn-secondary gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="btn-destructive gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-card overflow-hidden animate-fade-in">
        <div className="h-32 gradient-primary relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card flex items-center justify-center gradient-primary text-white text-2xl font-bold shadow-xl">
              {getInitials(employee.firstName, employee.lastName)}
            </div>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-muted-foreground">{employee.designation}</p>
              <p className="text-sm text-muted-foreground mt-1">{employee.employeeId}</p>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <span className={cn('badge', getStatusBadgeClass(employee.status))}>
                {employee.status}
              </span>
              <span className={cn('badge', getRoleBadgeClass(employee.user.role))}>
                {getRoleDisplayName(employee.user.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{employee.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">{employee.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Info */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Employment Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium text-foreground">{employee.department.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joining Date</p>
                <p className="text-sm font-medium text-foreground">{formatDate(employee.joiningDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="text-sm font-medium text-foreground">{formatCurrency(Number(employee.salary))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reporting Manager */}
      {employee.manager && (
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Reporting Manager</h3>
          <div
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/employees/${employee.manager!.id}`)}
          >
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(employee.manager.firstName, employee.manager.lastName)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {employee.manager.firstName} {employee.manager.lastName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Direct Reports */}
      {reportees.length > 0 && (
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            <Users className="w-5 h-5 inline mr-2 text-primary" />
            Direct Reports ({reportees.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reportees.map((reportee) => (
              <div
                key={reportee.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/employees/${reportee.id}`)}
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(reportee.firstName, reportee.lastName)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {reportee.firstName} {reportee.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{reportee.designation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
