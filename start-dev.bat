@echo off
echo Starting LifeMate backend...
start "LifeMate Backend" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo Waiting for backend to start (15 seconds)...
timeout /t 15 /nobreak >nul

echo Starting LifeMate frontend...
start "LifeMate Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both services are starting.
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo.
echo Close the two terminal windows to stop the servers.
