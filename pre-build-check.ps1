# ============================================================
# Pre-Build Check Script
# Kiem tra tat ca dieu kien truoc khi build APK
# Usage: ./pre-build-check.ps1
# ============================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRE-BUILD CHECK - THIETKERESORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# ==================== 1. EAS CLI ====================
Write-Host "1. EAS CLI" -ForegroundColor Yellow
$easVersion = eas --version 2>$null
if ($easVersion) {
    Write-Host "   [OK] EAS CLI: $easVersion" -ForegroundColor Green
    $whoami = eas whoami 2>$null
    if ($whoami) {
        Write-Host "   [OK] Logged in as: $whoami" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Not logged in. Run: eas login" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   [ERROR] EAS CLI not installed. Run: npm i -g eas-cli" -ForegroundColor Red
    $errors++
}

# ==================== 2. Environment Files ====================
Write-Host ""
Write-Host "2. Environment Files" -ForegroundColor Yellow
$envFiles = @(".env", ".env.development", ".env.staging", ".env.production")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "   [OK] $file" -ForegroundColor Green
    } else {
        if ($file -eq ".env") {
            Write-Host "   [ERROR] $file (REQUIRED)" -ForegroundColor Red
            $errors++
        } else {
            Write-Host "   [WARN] $file (optional)" -ForegroundColor Yellow
            $warnings++
        }
    }
}

# ==================== 3. Config Files ====================
Write-Host ""
Write-Host "3. Config Files" -ForegroundColor Yellow
$configFiles = @("eas.json", "app.config.ts", "package.json", "tsconfig.json")
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "   [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] $file (REQUIRED)" -ForegroundColor Red
        $errors++
    }
}

# ==================== 4. Assets ====================
Write-Host ""
Write-Host "4. Assets" -ForegroundColor Yellow
$assets = @(
    "assets/images/icon.png",
    "assets/images/splash-icon.png",
    "assets/images/android-icon-foreground.png",
    "assets/images/android-icon-background.png",
    "assets/images/favicon.png"
)
foreach ($asset in $assets) {
    if (Test-Path $asset) {
        Write-Host "   [OK] $asset" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] $asset (missing)" -ForegroundColor Yellow
        $warnings++
    }
}

# ==================== 5. Node Modules ====================
Write-Host ""
Write-Host "5. Node Modules" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $moduleCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "   [OK] node_modules - $moduleCount packages" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] node_modules missing. Run: npm install" -ForegroundColor Red
    $errors++
}

# ==================== 6. API Configuration ====================
Write-Host ""
Write-Host "6. API Configuration" -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw -ErrorAction SilentlyContinue
if ($envContent -match "EXPO_PUBLIC_API_BASE_URL") {
    Write-Host "   [OK] API_BASE_URL configured" -ForegroundColor Green
} else {
    Write-Host "   [WARN] API_BASE_URL not found in .env" -ForegroundColor Yellow
    $warnings++
}

# ==================== SUMMARY ====================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors -eq 0) {
    Write-Host ""
    Write-Host "  [OK] All critical checks passed!" -ForegroundColor Green
    Write-Host "  [WARN] Warnings: $warnings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  READY TO BUILD!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Commands:" -ForegroundColor White
    Write-Host "    ./build-apk.ps1 -env preview    # Internal APK" -ForegroundColor Gray
    Write-Host "    ./build-apk.ps1 -env prod       # Play Store AAB" -ForegroundColor Gray
    Write-Host "    ./build-apk.ps1 -env prod-apk   # Production APK" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  [ERROR] $errors critical errors found!" -ForegroundColor Red
    Write-Host "  [WARN] $warnings warnings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Please fix the errors above before building." -ForegroundColor Red
    Write-Host ""
}
