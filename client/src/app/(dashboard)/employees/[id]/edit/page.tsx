'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { employeeApi } from '@/lib/api';
import { Employee } from '@/types';
import EmployeeForm from '@/components/employees/EmployeeForm';

export default function EditEmployeePage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await employeeApi.getById(params.id as string);
        setEmployee(response.data.data);
      } catch (error) {
        console.error('Failed to fetch employee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!employee) {
    return <div className="text-center py-20 text-muted-foreground">Employee not found</div>;
  }

  return <EmployeeForm employee={employee} isEdit />;
}
