# LoanFlow - Loan Management System

A full-stack enterprise-grade Loan Management System built with the MERN stack, featuring a Borrower Portal and Operations Dashboard with role-based access control.

## Tech Stack

| Layer      | Technology                                     |
| ---------- | ---------------------------------------------- |
| Frontend   | Next.js 15 (App Router), TypeScript, Tailwind  |
| Backend    | Express.js, TypeScript, Node.js                |
| Database   | MongoDB with Mongoose ODM                      |
| Auth       | JWT (JSON Web Tokens)                          |
| State      | Zustand                                        |
| Validation | Zod (Frontend + Backend)                       |
| Uploads    | Multer (PDF, JPG, PNG — max 5MB)               |

## Architecture

```
Modular Monolith Architecture
├── backend/     → Express.js API (Layered: Routes → Controllers → Models)
└── frontend/    → Next.js App Router (Pages → Services → Stores)
```

## Features

### Borrower Portal
- User registration and JWT authentication
- Multi-step loan application (Personal Details → Upload → Loan Config → Status)
- BRE (Business Rule Engine) eligibility checks (age, salary, PAN, employment)
- Salary slip upload with drag & drop
- Real-time loan status tracking with progress bars

### Operations Dashboard (RBAC)
- **Sales**: Dashboard stats, financial summary, sales leads (borrowers without applications)
- **Sanction**: Approve/reject loan applications with remarks
- **Disbursement**: Disburse sanctioned loans
- **Collection**: Record payments, view payment history, auto-close on full payment

### Loan Lifecycle
```
DRAFT → APPLIED → SANCTIONED → DISBURSED → CLOSED
                 ↘ REJECTED
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
# Edit .env if needed (MongoDB URI, JWT secret)
npm run seed    # Creates default executive accounts
npm run dev     # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:3000
```

### 3. Default Accounts

| Role         | Email                | Password     |
| ------------ | -------------------- | ------------ |
| Admin        | admin@test.com       | Password@123 |
| Sales        | sales@test.com       | Password@123 |
| Sanction     | sanction@test.com    | Password@123 |
| Disbursement | disbursement@test.com| Password@123 |
| Collection   | collection@test.com  | Password@123 |

Register as a new user to get the **Borrower** role.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register borrower
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Loans (Borrower)
- `POST /api/loans/personal-details` - Save personal details (BRE check)
- `POST /api/uploads/salary-slip` - Upload salary slip
- `POST /api/loans/apply` - Submit loan application
- `GET /api/loans/my-loans` - Get borrower's loans

### Operations
- `GET /api/loans/sanction/list` - Get applied loans
- `PATCH /api/loans/sanction/:id/approve` - Approve loan
- `PATCH /api/loans/sanction/:id/reject` - Reject loan
- `GET /api/loans/disbursement/list` - Get sanctioned loans
- `PATCH /api/loans/disbursement/:id/disburse` - Disburse loan
- `GET /api/loans/collection/list` - Get disbursed loans
- `POST /api/collection/:id/payment` - Record payment
- `GET /api/dashboard/stats` - Dashboard statistics

## Project Structure

```
backend/src/
├── config/          # DB, env, logger
├── middleware/      # auth, role, error, validate
├── modules/
│   ├── auth/        # register, login, me
│   ├── loans/       # CRUD, sanction, disburse
│   ├── payments/    # record, history
│   ├── uploads/     # multer salary slip
│   └── dashboard/   # aggregate stats
├── utils/           # jwt, bcrypt, bre, emi, helpers
├── types/           # TypeScript definitions
├── seed/            # seedRoles.ts
├── app.ts           # Express setup
└── server.ts        # Entry point

frontend/src/
├── app/
│   ├── login/       # Login page
│   ├── register/    # Register page
│   ├── borrower/    # Multi-step application
│   └── dashboard/   # Operations modules
├── services/        # API call layer
├── store/           # Zustand stores
├── types/           # Shared types
└── lib/             # Axios client
```
