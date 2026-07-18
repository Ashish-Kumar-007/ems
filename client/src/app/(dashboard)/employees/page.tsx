'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { employeeApi, departmentApi } from '@/lib/api';
import { Employee, Department, PaginationInfo } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import {
  formatDate, formatCurrency, getInitials, cn,
  getRoleBadgeClass, getRoleDisplayName, getStatusBadgeClass,
} from '@/lib/utils';
import {
  Search, Plus, Upload, Filter, ChevronLeft, ChevronRight,
  ArrowUpDown, Eye, Pencil, Trash2, X, Users,
} from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // CSV import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (department) params.department = department;
      if (role) params.role = role;
      if (status) params.status = status;

      const response = await employeeApi.getAll(params);
      setEmployees(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, department, role, status]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    departmentApi.getAll().then((res) => setDepartments(res.data.data)).catch(console.error);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeApi.delete(id);
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const response = await employeeApi.importCsv(importFile);
      alert(`${response.data.data.created} employees imported successfully`);
      setShowImportModal(false);
      setImportFile(null);
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setRole('');
    setStatus('');
    setPage(1);
  };

  const hasActiveFilters = search || department || role || status;
  const canCreate = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';
  const canDelete = user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Manage your workforce ({pagination?.total || 0} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="btn-secondary gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import CSV</span>
              </button>
              <button
                onClick={() => router.push('/employees/new')}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-secondary gap-2',
              hasActiveFilters && 'border-primary text-primary'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-ghost gap-1 text-muted-foreground">
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Row */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-border animate-fade-in">
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="HR_MANAGER">HR Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  <button onClick={() => handleSort('joiningDate')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Joined
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-10 rounded bg-muted animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">No employees found</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr
                    key={emp.id}
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
                            onClick={() => handleDelete(emp.id)}
                            className="btn-ghost p-2 rounded-lg text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
                className="btn-ghost p-2 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'btn-ghost px-3 py-1 rounded-lg text-sm',
                      pageNum === page && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="btn-ghost p-2 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Import Employees</h3>
              <button onClick={() => setShowImportModal(false)} className="btn-ghost p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file with columns: firstName, lastName, email, phone, department, designation, salary, joiningDate, status
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="input-field mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowImportModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="btn-primary"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
