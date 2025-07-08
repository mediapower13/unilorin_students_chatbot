@echo off
cd /d "%~dp0\.."
echo Starting Flask backend...
start "Flask Backend" cmd /k "cd backend && python main.py"

echo Waiting for Flask to start...
timeout /t 3 /nobreak >nul

echo Starting Next.js frontend...
start "Next.js Frontend" cmd /k "npm run dev"

echo Both services are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Press any key to exit...
pause >nul
