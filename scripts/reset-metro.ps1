# PowerShell Script: Full Metro Cache Reset
# ==========================================
# Giải quyết vấn đề:
# - Metro cache bị corrupt
# - JavaScript heap out of memory
# - Slow bundling
#
# Usage: .\scripts\reset-metro.ps1
# Usage with full reinstall: .\scripts\reset-metro.ps1 -FullReinstall

param(
    [switch]$FullReinstall,
    [switch]$SkipNodeModules,
    [int]$MemoryLimit = 8192
)

Write-Host "=== Metro Cache Reset Script ===" -ForegroundColor Cyan
Write-Host ""

# Store original location
$originalLocation = Get-Location
$projectRoot = Split-Path $PSScriptRoot -Parent

# Change to project root
Set-Location $projectRoot

Write-Host "[1/6] Stopping any running Metro processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*metro*" -or $_.CommandLine -like "*expo*" } | 
    Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "[2/6] Clearing Metro cache directories..." -ForegroundColor Yellow
$cacheDirs = @(
    ".expo",
    ".metro-health-check-*",
    "node_modules/.cache",
    "$env:TEMP\metro-*",
    "$env:TEMP\haste-map-*",
    "$env:TEMP\react-*"
)

foreach ($dir in $cacheDirs) {
    $expanded = [Environment]::ExpandEnvironmentVariables($dir)
    if (Test-Path $expanded) {
        Write-Host "  Removing: $expanded" -ForegroundColor Gray
        Remove-Item -Path $expanded -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[3/6] Clearing Android build cache..." -ForegroundColor Yellow
$androidDirs = @(
    "android\.gradle",
    "android\build",
    "android\app\build"
)

foreach ($dir in $androidDirs) {
    if (Test-Path $dir) {
        Write-Host "  Removing: $dir" -ForegroundColor Gray
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[4/6] Clearing iOS build cache..." -ForegroundColor Yellow
$iosDirs = @(
    "ios\build",
    "ios\Pods"
)

foreach ($dir in $iosDirs) {
    if (Test-Path $dir) {
        Write-Host "  Removing: $dir" -ForegroundColor Gray
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

if ($FullReinstall -and -not $SkipNodeModules) {
    Write-Host "[5/6] Full reinstall - removing node_modules..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "[5/6] Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[5/6] Skipping node_modules (use -FullReinstall to include)..." -ForegroundColor Gray
}

Write-Host "[6/6] Starting Metro with optimized memory..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Starting Expo with ${MemoryLimit}MB heap ===" -ForegroundColor Green
Write-Host ""

# Set environment variable and start
$env:NODE_OPTIONS = "--max-old-space-size=$MemoryLimit"

# Return to original location
Set-Location $originalLocation

Write-Host "Cache cleared! Run 'npm run start:clear' to start fresh." -ForegroundColor Green
Write-Host ""
Write-Host "Recommended commands:" -ForegroundColor Cyan
Write-Host "  npm run start:clear     - Start with clear cache (8GB heap)" -ForegroundColor White
Write-Host "  npm run start:turbo     - Start with turbo mode" -ForegroundColor White
Write-Host "  npm start               - Normal start" -ForegroundColor White
