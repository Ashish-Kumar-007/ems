import { PrismaClient, Role, EmployeeStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Engineering', description: 'Software Engineering and Development' } }),
    prisma.department.create({ data: { name: 'Human Resources', description: 'People Operations and HR Management' } }),
    prisma.department.create({ data: { name: 'Finance', description: 'Financial Planning and Accounting' } }),
    prisma.department.create({ data: { name: 'Marketing', description: 'Marketing Strategy and Brand Management' } }),
    prisma.department.create({ data: { name: 'Operations', description: 'Business Operations and Logistics' } }),
  ]);

  console.log(`✅ Created ${departments.length} departments`);

  const [engineering, hr, finance, marketing, operations] = departments;
  const password = await bcrypt.hash('Password@123', 12);

  // Helper to create user + employee
  const createEmployee = async (
    email: string,
    role: Role,
    firstName: string,
    lastName: string,
    phone: string,
    departmentId: string,
    designation: string,
    salary: number,
    joiningDate: string,
    employeeId: string,
    status: EmployeeStatus = 'ACTIVE',
    managerId?: string,
  ) => {
    const user = await prisma.user.create({
      data: { email, password, role },
    });

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        userId: user.id,
        firstName,
        lastName,
        phone,
        departmentId,
        designation,
        salary,
        joiningDate: new Date(joiningDate),
        status,
        managerId: managerId || null,
      },
    });

    return employee;
  };

  // ── Super Admin ──
  const ceo = await createEmployee(
    'admin@ems.com', Role.SUPER_ADMIN,
    'Rajesh', 'Sharma', '+91-9876543210',
    engineering.id, 'CEO & Super Admin', 250000,
    '2020-01-15', 'EMP-001'
  );

  // ── Department Heads (HR Managers) ──
  const vpEng = await createEmployee(
    'priya.patel@ems.com', Role.HR_MANAGER,
    'Priya', 'Patel', '+91-9876543211',
    engineering.id, 'VP of Engineering', 180000,
    '2020-03-01', 'EMP-002', 'ACTIVE', ceo.id
  );

  const hrHead = await createEmployee(
    'anita.kumar@ems.com', Role.HR_MANAGER,
    'Anita', 'Kumar', '+91-9876543212',
    hr.id, 'HR Director', 160000,
    '2020-02-15', 'EMP-003', 'ACTIVE', ceo.id
  );

  const finHead = await createEmployee(
    'vikram.singh@ems.com', Role.HR_MANAGER,
    'Vikram', 'Singh', '+91-9876543213',
    finance.id, 'Finance Director', 170000,
    '2020-04-01', 'EMP-004', 'ACTIVE', ceo.id
  );

  const mktHead = await createEmployee(
    'neha.gupta@ems.com', Role.HR_MANAGER,
    'Neha', 'Gupta', '+91-9876543214',
    marketing.id, 'Marketing Director', 155000,
    '2020-05-01', 'EMP-005', 'ACTIVE', ceo.id
  );

  // ── Engineering Team ──
  const techLead = await createEmployee(
    'amit.joshi@ems.com', Role.EMPLOYEE,
    'Amit', 'Joshi', '+91-9876543215',
    engineering.id, 'Tech Lead', 140000,
    '2021-01-10', 'EMP-006', 'ACTIVE', vpEng.id
  );

  await createEmployee(
    'sneha.reddy@ems.com', Role.EMPLOYEE,
    'Sneha', 'Reddy', '+91-9876543216',
    engineering.id, 'Senior Developer', 120000,
    '2021-06-15', 'EMP-007', 'ACTIVE', techLead.id
  );

  await createEmployee(
    'rahul.verma@ems.com', Role.EMPLOYEE,
    'Rahul', 'Verma', '+91-9876543217',
    engineering.id, 'Full Stack Developer', 95000,
    '2022-03-01', 'EMP-008', 'ACTIVE', techLead.id
  );

  await createEmployee(
    'divya.nair@ems.com', Role.EMPLOYEE,
    'Divya', 'Nair', '+91-9876543218',
    engineering.id, 'Frontend Developer', 85000,
    '2022-08-20', 'EMP-009', 'ACTIVE', techLead.id
  );

  await createEmployee(
    'karthik.menon@ems.com', Role.EMPLOYEE,
    'Karthik', 'Menon', '+91-9876543219',
    engineering.id, 'DevOps Engineer', 110000,
    '2021-11-01', 'EMP-010', 'ACTIVE', vpEng.id
  );

  // ── HR Team ──
  await createEmployee(
    'pooja.shah@ems.com', Role.EMPLOYEE,
    'Pooja', 'Shah', '+91-9876543220',
    hr.id, 'HR Manager', 90000,
    '2021-04-15', 'EMP-011', 'ACTIVE', hrHead.id
  );

  await createEmployee(
    'suresh.iyer@ems.com', Role.EMPLOYEE,
    'Suresh', 'Iyer', '+91-9876543221',
    hr.id, 'HR Executive', 65000,
    '2023-01-10', 'EMP-012', 'ACTIVE', hrHead.id
  );

  // ── Finance Team ──
  await createEmployee(
    'meera.das@ems.com', Role.EMPLOYEE,
    'Meera', 'Das', '+91-9876543222',
    finance.id, 'Senior Accountant', 85000,
    '2021-07-01', 'EMP-013', 'ACTIVE', finHead.id
  );

  await createEmployee(
    'arjun.pillai@ems.com', Role.EMPLOYEE,
    'Arjun', 'Pillai', '+91-9876543223',
    finance.id, 'Financial Analyst', 75000,
    '2022-09-15', 'EMP-014', 'ACTIVE', finHead.id
  );

  // ── Marketing Team ──
  await createEmployee(
    'ritu.kapoor@ems.com', Role.EMPLOYEE,
    'Ritu', 'Kapoor', '+91-9876543224',
    marketing.id, 'Content Manager', 72000,
    '2022-02-01', 'EMP-015', 'ACTIVE', mktHead.id
  );

  // ── Inactive Employee ──
  await createEmployee(
    'sanjay.mohan@ems.com', Role.EMPLOYEE,
    'Sanjay', 'Mohan', '+91-9876543225',
    operations.id, 'Operations Manager', 95000,
    '2021-09-01', 'EMP-016', 'INACTIVE'
  );

  console.log('✅ Created 16 employees with organizational hierarchy');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('────────────────────────────────────────');
  console.log('Super Admin:  admin@ems.com       / Password@123');
  console.log('HR Manager:   priya.patel@ems.com / Password@123');
  console.log('Employee:     amit.joshi@ems.com  / Password@123');
  console.log('────────────────────────────────────────');
  console.log('');
  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
