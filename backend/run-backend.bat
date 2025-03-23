@echo off
echo ========================================
echo Shuttle Management System - Backend
echo ========================================

echo Setting environment variables...
set JWT_SECRET=shuttlesecret123456789

echo Installing dependencies...
call npm install

echo Starting backend server...
call npm run dev

echo.
echo Backend server started at http://localhost:5001
echo JWT_SECRET is set for authentication
echo ======================================== 