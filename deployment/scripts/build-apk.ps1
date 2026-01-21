# ============================================================
# Build APK Script - All Environments
# Usage: ./build-apk.ps1 -env [dev|preview|prod|prod-apk]
# ============================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "preview", "prod", "prod-apk")]
    [string]$env = "preview"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📱 BUILD APK - THIETKERESORT APP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Map environment to EAS profile
$profileMap = @{
    "dev"      = "development"
    "preview"  = "preview"
    "prod"     = "production"
    "prod-apk" = "production-apk"
}

$buildProfile = $profileMap[$env]

Write-Host "🔧 Environment: $env" -ForegroundColor Yellow
Write-Host "📦 EAS Profile: $buildProfile" -ForegroundColor Yellow
Write-Host ""

# Check EAS CLI
Write-Host "⏳ Checking EAS CLI..." -ForegroundColor Gray
$easVersion = eas --version 2>$null
if (-not $easVersion) {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
}
Write-Host "✅ EAS CLI: $easVersion" -ForegroundColor Green

# Check login status
Write-Host "⏳ Checking Expo login..." -ForegroundColor Gray
$whoami = eas whoami 2>$null
if (-not $whoami) {
    Write-Host "❌ Not logged in. Please run: eas login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green

# Copy environment file
Write-Host ""
Write-Host "📋 Setting up environment..." -ForegroundColor Yellow

$envFile = ".env.$env"
if ($env -eq "dev") { $envFile = ".env.development" }
if ($env -eq "prod" -or $env -eq "prod-apk") { $envFile = ".env.production" }

if (Test-Path $envFile) {
    Copy-Item $envFile ".env" -Force
    Write-Host "✅ Copied $envFile to .env" -ForegroundColor Green
} else {
    Write-Host "⚠️ $envFile not found, using existing .env" -ForegroundColor Yellow
}

# Display build info
Write-Host ""
Write-Host "📊 Build Configuration:" -ForegroundColor Cyan
Write-Host "  - Profile: $buildProfile"
Write-Host "  - Platform: Android"
if ($env -eq "prod") {
    Write-Host "  - Output: AAB (App Bundle for Play Store)"
} else {
    Write-Host "  - Output: APK (Direct install)"
}
Write-Host ""

# Confirmation
$confirm = Read-Host "🚀 Start build? (Y/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Host "❌ Build cancelled." -ForegroundColor Red
    exit 0
}

# Run build
Write-Host ""
Write-Host "🏗️ Starting EAS Build..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Gray

try {
    eas build -p android --profile $buildProfile --non-interactive
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ BUILD COMPLETED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📥 Download APK from: https://expo.dev" -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
