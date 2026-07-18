# Employee Management System (EMS) - API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### 1. Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticate user and get tokens.
- **Request Body**:
  ```json
  {
    "email": "admin@ems.com",
    "password": "Password@123"
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { ... },
      "tokens": {
        "accessToken": "ey...",
        "refreshToken": "ey..."
      }
    }
  }
  ```

### 2. Logout
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "refreshToken": "ey..."
  }
  ```
- **Success Response**: 200 OK

### 3. Get Current User Profile
- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 200 OK
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "employee": { ... }
    }
  }
  ```

---

## Employees

### 1. Get All Employees
- **URL**: `/employees`
- **Method**: `GET`
- **Auth Required**: Yes (SUPER_ADMIN, HR_MANAGER)
- **Query Parameters**:
  - `search` (string)
  - `department` (uuid)
  - `role` (enum: SUPER_ADMIN, HR_MANAGER, EMPLOYEE)
  - `status` (enum: ACTIVE, INACTIVE)
  - `sortBy` (string)
  - `sortOrder` (enum: asc, desc)
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
- **Success Response**: 200 OK

### 2. Get Employee by ID
- **URL**: `/employees/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Own record or SUPER_ADMIN/HR_MANAGER)
- **Success Response**: 200 OK

### 3. Create Employee
- **URL**: `/employees`
- **Method**: `POST`
- **Auth Required**: Yes (SUPER_ADMIN, HR_MANAGER)
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@ems.com",
    "phone": "+91-9876543210",
    "departmentId": "uuid",
    "designation": "Developer",
    "salary": 100000,
    "joiningDate": "2024-01-01",
    "status": "ACTIVE",
    "role": "EMPLOYEE",
    "managerId": "uuid"
  }
  ```
- **Success Response**: 201 Created

### 4. Update Employee
- **URL**: `/employees/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Depends on fields and role)
- **Request Body**: Partial Employee Object
- **Success Response**: 200 OK

### 5. Delete Employee
- **URL**: `/employees/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (SUPER_ADMIN only)
- **Success Response**: 200 OK

### 6. Import Employees (CSV)
- **URL**: `/employees/import`
- **Method**: `POST`
- **Auth Required**: Yes (SUPER_ADMIN, HR_MANAGER)
- **Content-Type**: `multipart/form-data`
- **Body Form Data**: `file` (CSV File)
- **Success Response**: 200 OK

---

## Organization

### 1. Get Organization Tree
- **URL**: `/organization/tree`
- **Method**: `GET`
- **Auth Required**: Yes (SUPER_ADMIN, HR_MANAGER)
- **Success Response**: 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "...",
        "firstName": "...",
        "children": [ ... ]
      }
    ]
  }
  ```

### 2. Get Reportees
- **URL**: `/employees/:id/reportees`
- **Method**: `GET`
- **Auth Required**: Yes (SUPER_ADMIN, HR_MANAGER)
- **Success Response**: 200 OK

### 3. Assign Manager
- **URL**: `/employees/:id/manager`
- **Method**: `PATCH`
- **Auth Required**: Yes (SUPER_ADMIN)
- **Request Body**:
  ```json
  {
    "managerId": "uuid"
  }
  ```
- **Success Response**: 200 OK

---

## Dashboard

### 1. Get Dashboard Stats
- **URL**: `/dashboard/stats`
- **Method**: `GET`
- **Auth Required**: Yes (SUPER_ADMIN, HR_MANAGER)
- **Success Response**: 200 OK

---

## Departments

### 1. Get All Departments
- **URL**: `/departments`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 200 OK
