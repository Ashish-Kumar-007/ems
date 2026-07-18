'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { employeeApi } from '@/lib/api';
import {
  formatDate, formatCurrency, getInitials, cn,
  getRoleBadgeClass, getRoleDisplayName, getStatusBadgeClass,
} from '@/lib/utils';
import {
  UserCircle, Mail, Phone, Building2, Calendar, Briefcase,
  Save, Loader2, Pencil, X,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, employee } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    phone: employee?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!employee) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await employeeApi.update(employee.id, formData);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!employee || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <UserCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Profile not available</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">View and manage your personal information</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm animate-fade-in">
          {success}
        </div>
      )}

      {/* Profile Card */}
      <div className="glass-card overflow-hidden animate-fade-in">
        <div className="h-32 gradient-primary relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card flex items-center justify-center gradient-primary text-white text-2xl font-bold shadow-xl">
              {getInitials(employee.firstName, employee.lastName)}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-ghost bg-white/10 text-white backdrop-blur-sm gap-2 rounded-xl">
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <button onClick={() => setEditing(false)} className="btn-ghost bg-white/10 text-white backdrop-blur-sm gap-2 rounded-xl">
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              {editing ? (
                <div className="flex gap-2 mb-2">
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field text-lg font-bold"
                    placeholder="First Name"
                  />
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field text-lg font-bold"
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-foreground">
                  {employee.firstName} {employee.lastName}
                </h1>
              )}
              <p className="text-muted-foreground">{employee.designation}</p>
              <p className="text-sm text-muted-foreground mt-1">{employee.employeeId}</p>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <span className={cn('badge', getStatusBadgeClass(employee.status))}>
                {employee.status}
              </span>
              <span className={cn('badge', getRoleBadgeClass(user.role))}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                {editing ? (
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground">{employee.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Employment</h3>
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
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium text-foreground">{formatDate(employee.joiningDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      {editing && (
        <div className="flex justify-end animate-fade-in">
          <button onClick={handleSave} disabled={loading} className="btn-primary gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
