@echo off
title StayHTM - Start Project
echo =======================================================
echo               KHOI CHAY DU AN STAYHTM
echo =======================================================
echo.
echo [*] Dang khoi chay may chu Backend (Port 3001) trong cua so moi...
start cmd /k "cd backend-simplified && npm run dev"

echo.
echo [*] Dang khoi chay may chu Frontend (Port 5173) trong cua so moi...
start cmd /k "npm run dev"

echo.
echo =======================================================
echo [SUCCESS] Du an dang duoc khoi dong o 2 cua so moi.
echo            👉 Duong dan: http://localhost:5173
echo =======================================================
echo.
pause
