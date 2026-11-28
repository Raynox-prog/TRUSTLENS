@echo off
chcp 65001 >nul
cls

echo ==============================================================================
echo                 SHIELDLY AI — DUAL STACK LAUNCHER
echo ==============================================================================
echo.
echo   [1/4] Checking Node.js environment...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

echo   [2/4] Verifying Frontend dependencies...
if not exist "node_modules\" (
    echo   Installing frontend dependencies (this may take a minute)...
    call npm install
)

echo   [3/4] Verifying Backend dependencies...
if not exist "backend\node_modules\" (
    echo   Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

echo.
echo ==============================================================================
echo   [4/4] Starting SHIELDLY AI Full Stack:
echo     - Backend API : http://localhost:5000  (Health: /health)
echo     - Frontend Web: http://localhost:3000
echo ==============================================================================
echo.
echo   NOTE: Add your GEMINI_API_KEY in .env or backend\.env to enable
echo   live AI reasoning, message scanning, and screenshot vision OCR!
echo.
echo   Launching server processes in dedicated terminal windows...

REM Launch Backend API in new window on port 5000
start "SHIELDLY Backend API [Port 5000]" cmd /k "title SHIELDLY Backend API [Port 5000] && cd backend && npm run dev"

REM Give backend a moment to spin up
timeout /t 2 /nobreak >nul

REM Launch Frontend Website in new window on port 3000
start "SHIELDLY Frontend Website [Port 3000]" cmd /k "title SHIELDLY Frontend Website [Port 3000] && npm run dev"

echo.
echo   [SUCCESS] Both Frontend and Backend are running!
echo   Open your browser at: http://localhost:3000
echo.
echo   Press any key to close this launcher window (servers will keep running).
pause >nul
