# Employee Management System (EMS)

A comprehensive Full Stack Employee Management System built with Next.js, Express.js, PostgreSQL, and Prisma ORM.

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JWT (Access & Refresh Tokens), bcrypt

## Features

- **Authentication:** Secure login with JWT tokens and automatic refresh.
- **Role-Based Access Control (RBAC):** Three distinct roles (Super Admin, HR Manager, Employee) with varied access permissions managed using the Strategy Pattern.
- **Employee Management:** Complete CRUD operations with pagination, sorting, filtering, and soft delete.
- **Organizational Hierarchy:** Visual tree representation of the company hierarchy and manager assignment with cirCheck the schemas are following proper LLD principles and relations 
Such as for many to many relations it should have mapping table and many to one or one to onr tables are handled inside the tablecular reference prevention.
- **Dashboard:** Interactive charts and statistics (total employees, department distribution, new joiner trends).
- **CSV Import:** Bulk import employees via CSV.
- **Premium UI:** Dark mode support, glassmorphism design, and micro-animations.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose (recommended for easy database setup)

### Running with Docker (Recommended)

1. Clone the repository and navigate to the project directory.
2. Run the following command:
   ```bash
   docker-compose up --build
   ```
3. The server will start on `http://localhost:5000` and the client on `http://localhost:3000`.

### Running Locally

#### Database Setup
1. Ensure PostgreSQL is running.
2. Update the `DATABASE_URL` in `server/.env` to point to your local database.

#### Server Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Apply Prisma migrations and seed the database:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

#### Client Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Seed Credentials

The database seed creates initial data including departments and employees. Use the following credentials to log in:

- **Super Admin:** `admin@ems.com` / `Password@123`
- **HR Manager:** `priya.patel@ems.com` / `Password@123`
- **Employee:** `amit.joshi@ems.com` / `Password@123`

## Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoints and request/response structures.

## Architecture

This project strictly adheres to **S.O.L.I.D. principles** and employs several design patterns:
- **Strategy Pattern:** For RBAC permissions (`SuperAdminStrategy`, `HRManagerStrategy`, `EmployeeStrategy`).
- **Repository Pattern:** For data access abstraction (`EmployeeRepository`, `UserRepository`).
- **Factory Pattern:** To instantiate the correct permission strategy.
- **Builder Pattern:** For constructing complex Prisma query parameters.
- **Chain of Responsibility:** For Express middleware (auth -> rbac -> validation -> controller).
