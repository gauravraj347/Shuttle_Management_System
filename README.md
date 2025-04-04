# 🚍 Shuttle Management System

A comprehensive web application for managing university shuttle services, bookings, and a student wallet system.

---

## ✨ Features

- 🔐 User Authentication (Student, Admin)
- 🗺️ Route and Stop Management
- 🚌 Shuttle Booking System
- 💰 Student Wallet System with Points Allocation
- 📊 Admin Dashboard with Management Tools

---

## ⚙️ Getting Started

### ✅ Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### 🚀 Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd shuttle-management-system
   ```

2. **Install Dependencies**
   ```bash
   cd backend
   npm install

   cd ../frontend
   npm install
   ```

3. **Run the Application**
   ```bash
   # In one terminal for the backend
   cd backend
   npm run dev

   # In another terminal for the frontend
   cd frontend
   npm run dev
   ```

---

## 🌐 Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)  
- **Backend API**: [http://localhost:5001](http://localhost:5001)

---

## 🛠️ Troubleshooting

### ❗ "Cannot read properties of undefined" Error

If this error occurs during login, ensure the `JWT_SECRET` environment variable is set:

```bash
set JWT_SECRET=shuttlesecret123456789
```

> 💡 This is usually handled automatically by the backend startup script.

### 👥 Empty Student List in Admin Dashboard

If the admin dashboard shows "0 Students":

1. Ensure both backend and frontend servers are running.
2. Run the seed script to populate test of sample data:
   ```bash
   cd backend
   node seed.js
   ```

---

## 🗂️ Project Structure

```
shuttle-management-system/
├── backend/     # Node.js/Express API server
├── frontend/    # React.js frontend application
```

---

## 🧑‍💼 Admin Dashboard Features

### 1. 🚏 Routes Management
- Create, edit, delete routes
- View associated stops and route details

### 2. 🛑 Stops Management
- Add, update, remove shuttle stops
- Define coordinates and stop types

### 3. 👨‍🎓 Student Management
- View all students and wallet balances
- Search and filter student records

### 4. 💳 Wallet Management
- Allocate monthly or semester points to students
- Distribute bonuses (festivals, events, etc.)
- Apply penalties for rule violations
- Manually adjust student wallet balances

