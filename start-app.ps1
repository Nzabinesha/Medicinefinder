# MediFinder Startup Script
Write-Host "🚀 Starting MediFinder Application..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found in PATH!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Or ensure Node.js is in your system PATH" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan

# Check backend dependencies
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "⚠️  Backend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Check frontend dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    npm install
}

# Create data directory if it doesn't exist
if (-not (Test-Path "backend\data")) {
    Write-Host "📁 Creating data directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path "backend\data" -Force | Out-Null
}

Write-Host ""
Write-Host "🌐 Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Write-Host "Starting backend server on http://localhost:3000" -ForegroundColor Yellow
$backendCommand = "cd '$PWD\backend'; Write-Host 'Backend Server' -ForegroundColor Green; Write-Host 'Running on http://localhost:3000' -ForegroundColor Cyan; Write-Host ''; node src/server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend in a new window
Write-Host "Starting frontend server on http://localhost:5173" -ForegroundColor Yellow
$frontendCommand = "cd '$PWD'; Write-Host 'Frontend Server' -ForegroundColor Green; Write-Host 'Running on http://localhost:5173' -ForegroundColor Cyan; Write-Host ''; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host ""
Write-Host "✅ Servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📍 Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

