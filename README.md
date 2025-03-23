# Shuttle Management System

A comprehensive application for managing university shuttle services, bookings, and student wallet system.

## Features

- User authentication (Student, Admin, Driver roles)
- Route and stop management
- Shuttle booking system
- Student wallet system with points allocation
- Admin dashboard with detailed management options
- Mobile-friendly responsive design

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd shuttle-management-system
```

2. Install dependencies:
```
cd backend
npm install
cd ../frontend
npm install
```

### Running the Application

#### Option 1: Using Batch Files (Recommended for Windows)

From the project root directory:

```
start-windows.bat
```

This will start both backend and frontend servers in separate terminal windows.

#### Option 2: Running Each Service Manually

**Backend:**
```
cd shuttle-management-system/backend
npm run dev
```

**Frontend:**
```
cd shuttle-management-system/frontend
npm run dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## Default Login Credentials

### Admin
- Email: admin@example.com
- Password: admin123

### Student
- Email: john@example.com
- Password: password123

## Troubleshooting

### "Cannot read properties of undefined" Error
If you encounter this error during login, make sure the JWT_SECRET environment variable is set. The backend startup script should handle this automatically, but you can manually set it:

```
set JWT_SECRET=shuttlesecret123456789
```

### Empty Student List in Admin Dashboard
If the admin dashboard shows "0 Students" or an empty student list:

1. Make sure both backend and frontend servers are running
2. Run the seed script to create test users:
```
cd shuttle-management-system
node seed-users.js
```

## Project Structure

- `/backend` - Node.js/Express API server
- `/frontend` - React.js frontend application
- `/docs` - Documentation files

## Admin Dashboard Features

The admin dashboard provides comprehensive management tools:

1. **Routes Management**
   - Create, edit, and delete routes
   - View route stops and details

2. **Stops Management**
   - Add, update, and remove stops
   - Set coordinates and stop types

3. **Student Management**
   - View all students and their wallet balances
   - Search and filter student records

4. **Wallet Management**
   - Monthly/Semester credit allocation to multiple students
   - Bonus points distribution for special occasions
   - Penalty deduction for rule violations
   - Manual balance adjustment for individual students 