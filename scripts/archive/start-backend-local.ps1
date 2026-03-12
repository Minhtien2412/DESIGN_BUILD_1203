# Start Backend Locally for Testing
# Purpose: Start NestJS backend on localhost:3000 for local development testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server Locally" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if backend is already running
$process = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainWindowTitle -like "*nest*" -or $_.CommandLine -like "*nest start*" 
}

if ($process) {
    Write-Host "⚠️  Backend already running (PID: $($process.Id))" -ForegroundColor Yellow
    $continue = Read-Host "Kill existing process and restart? (y/n)"
    if ($continue -eq 'y') {
        Stop-Process -Id $process.Id -Force
        Write-Host "✅ Stopped existing backend process" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "❌ Cancelled. Exiting..." -ForegroundColor Red
        exit
    }
}

# Navigate to backend folder
Set-Location "BE-baotienweb.cloud"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found! Copying from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found! Please create .env manually" -ForegroundColor Red
        exit
    }
}

# Check if dist folder exists (compiled output)
if (-not (Test-Path "dist")) {
    Write-Host "🔨 Building backend..." -ForegroundColor Yellow
    npm run build
}

# Check PostgreSQL connection
Write-Host "🔍 Checking database connection..." -ForegroundColor Cyan
$env:DATABASE_URL = (Get-Content .env | Where-Object { $_ -match '^DATABASE_URL=' }) -replace 'DATABASE_URL=', ''

if (-not $env:DATABASE_URL) {
    Write-Host "⚠️  DATABASE_URL not found in .env" -ForegroundColor Yellow
}

# Start backend in development mode
Write-Host "" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 Starting Backend on http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Health Check: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

# Start backend (blocking)
npm run start:dev
