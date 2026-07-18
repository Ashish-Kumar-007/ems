'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { employeeApi, departmentApi } from '@/lib/api';
import { Department, Employee } from '@/types';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface EmployeeFormProps {
  employee?: Employee | null;
  isEdit?: boolean;
}

export default function EmployeeFormPage({ employee, isEdit }: EmployeeFormProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.user?.email || '',
    phone: employee?.phone || '',
    departmentId: employee?.departmentId || '',
    designation: employee?.designation || '',
    salary: employee?.salary?.toString() || '',
    joiningDate: employee?.joiningDate
      ? new Date(employee.joiningDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: employee?.status || 'ACTIVE',
    role: employee?.user?.role || 'EMPLOYEE',
    managerId: employee?.managerId || '',
  });

  useEffect(() => {
    Promise.all([
      departmentApi.getAll(),
      employeeApi.getAll({ limit: 100 }),
    ]).then(([deptRes, empRes]) => {
      setDepartments(deptRes.data.data);
      setManagers(empRes.data.data.filter((e: Employee) => e.id !== employee?.id));
    }).catch(console.error);
  }, [employee?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary),
        joiningDate: formData.joiningDate,
        managerId: formData.managerId || null,
      };

      if (isEdit && employee) {
        await employeeApi.update(employee.id, payload);
      } else {
        await employeeApi.create(payload);
      }

      router.push('/employees');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      }
      setError(data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? (
      <p className="text-xs text-destructive mt-1">{errors[name][0]}</p>
    ) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost p-2 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update employee information' : 'Fill in the details to create a new employee'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input-field"
                required
              />
              {fieldError('firstName')}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input-field"
                required
              />
              {fieldError('lastName')}
            </div>
            {!isEdit && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
                {fieldError('email')}
              </div>
            )}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                Phone *
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+91-9876543210"
                required
              />
              {fieldError('phone')}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Employment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-foreground mb-1">
                Department *
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {fieldError('departmentId')}
            </div>
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-foreground mb-1">
                Designation *
              </label>
              <input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="input-field"
                required
              />
              {fieldError('designation')}
            </div>
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-foreground mb-1">
                Salary (₹) *
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
              {fieldError('salary')}
            </div>
            <div>
              <label htmlFor="joiningDate" className="block text-sm font-medium text-foreground mb-1">
                Joining Date *
              </label>
              <input
                id="joiningDate"
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange}
                className="input-field"
                required
              />
              {fieldError('joiningDate')}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reporting */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Reporting Structure</h3>
          <div>
            <label htmlFor="managerId" className="block text-sm font-medium text-foreground mb-1">
              Reporting Manager
            </label>
            <select
              id="managerId"
              name="managerId"
              value={formData.managerId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">None (Top-level)</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} — {m.designation}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
