@echo off
echo ========================================
echo Shuttle Management System - Frontend
echo ========================================

echo Installing dependencies...
call npm install

echo Starting frontend server...
call npm run dev

echo.
echo Frontend server started at http://localhost:3000
echo.
echo ADMIN LOGIN:
echo Username: admin@example.com
echo Password: admin123
echo.
echo STUDENT LOGIN:
echo Username: john@example.com
echo Password: password123
echo ======================================== 