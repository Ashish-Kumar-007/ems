'use client';

import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DashboardStats } from '@/types';
import { getRoleDisplayName } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Department Distribution Pie Chart */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Department Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.departmentDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="name"
              >
                {stats.departmentDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Role Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.roleDistribution.map(r => ({
              name: getRoleDisplayName(r.role),
              count: r.count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
              />
              <Bar
                dataKey="count"
                fill="#6366f1"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Join Trend */}
      <div className="lg:col-span-2 glass-card p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          <TrendingUp className="w-5 h-5 inline mr-2 text-primary" />
          Monthly Joining Trend
        </h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyJoinTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
              />
              <Bar
                dataKey="count"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                name="New Joiners"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
