@echo off
echo Starting MediFinder Application...
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm not found!
    pause
    exit /b 1
)

echo Checking dependencies...

REM Check backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Check frontend dependencies
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Create data directory if it doesn't exist
if not exist "backend\data" (
    echo Creating data directory...
    mkdir backend\data
)

echo.
echo Starting servers...
echo.

REM Start backend in a new window
echo Starting backend server on http://localhost:3000
start "MediFinder Backend" cmd /k "cd /d %~dp0backend && echo Backend Server && echo Running on http://localhost:3000 && echo. && node src/server.js"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
echo Starting frontend server on http://localhost:5173
start "MediFinder Frontend" cmd /k "cd /d %~dp0 && echo Frontend Server && echo Running on http://localhost:5173 && echo. && npm run dev"

echo.
echo Servers are starting in separate windows!
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
pause

