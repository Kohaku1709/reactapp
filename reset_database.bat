@echo off
title StayHTM - Reset Database
echo =======================================================
echo               StayHTM DATABASE RESET
echo =======================================================
echo.
echo [*] Dang chuan bi reset database StayHTM...
echo.

:: Chuyen huong vao thu muc backend de chay migration & seed
cd backend-simplified
echo [*] Chay Migration: Xoa and tao lai cac bang...
call npm run db:migrate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Migration that bai. Vui long kiem tra lai ket noi Database trong .env.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [*] Chay Seed: Them 82 khach san Viet Nam va user demo...
call npm run db:seed
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Seed that bai.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =======================================================
echo [SUCCESS] Da reset co so du lieu hoan toan thanh cong!
echo =======================================================
echo.
pause
