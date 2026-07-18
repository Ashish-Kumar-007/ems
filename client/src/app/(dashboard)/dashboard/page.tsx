'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { DashboardStats, Employee } from '@/types';
import { formatDate, formatCurrency, getInitials, getRoleBadgeClass, getRoleDisplayName, cn } from '@/lib/utils';
import { Users, UserCheck, UserX, Building2, TrendingUp, ArrowUpRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import charts so recharts doesn't block initial JS bundle
const DashboardCharts = dynamic(() => import('./DashboardCharts'), { ssr: false });

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8'];
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function DashboardPage() {
  const { data: response, isLoading: loading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardApi.getStats(),
  });

  const stats: DashboardStats | null = response?.data?.data || null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Employees',
      value: stats.total,
      icon: <Users className="w-6 h-6" />,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Active Employees',
      value: stats.active,
      icon: <UserCheck className="w-6 h-6" />,
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Inactive Employees',
      value: stats.inactive,
      icon: <UserX className="w-6 h-6" />,
      gradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Departments',
      value: stats.departmentCount,
      icon: <Building2 className="w-6 h-6" />,
      gradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your workforce overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className="stat-card bg-card border border-border animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2 animate-count-up">
                  {card.value}
                </p>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', card.bgLight)}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>
            {/* Decorative gradient line */}
            <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r rounded-b-2xl', card.gradient)} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts stats={stats} />

      {/* Recent Joiners */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Joiners</h3>
          <div className="space-y-4">
            {stats.recentJoiners.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {getInitials(emp.firstName, emp.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {emp.designation}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(emp.joiningDate)}
                </span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
