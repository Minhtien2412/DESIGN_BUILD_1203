# ============================================================
# Download APK Script
# Tu dong download APK tu EAS Build
# Usage: ./download-apk.ps1 -buildId <build-id>
# ============================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$buildId
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DOWNLOAD APK - THIETKERESORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create builds directory if not exists
$buildsDir = ".\builds"
if (-not (Test-Path $buildsDir)) {
    New-Item -ItemType Directory -Path $buildsDir | Out-Null
    Write-Host "[INFO] Created builds directory" -ForegroundColor Yellow
}

if ($buildId) {
    # Download specific build
    Write-Host "[INFO] Downloading build: $buildId" -ForegroundColor Yellow
    
    # Get build info
    $buildInfo = eas build:view $buildId --json 2>$null | ConvertFrom-Json
    
    if ($buildInfo.artifacts.buildUrl) {
        $downloadUrl = $buildInfo.artifacts.buildUrl
        $fileName = "builds\APP_DESIGN_BUILD-$($buildInfo.buildProfile)-$(Get-Date -Format 'yyyyMMdd-HHmmss').apk"
        
        Write-Host "[INFO] Downloading from: $downloadUrl" -ForegroundColor Yellow
        Invoke-WebRequest -Uri $downloadUrl -OutFile $fileName
        
        Write-Host ""
        Write-Host "[OK] Downloaded: $fileName" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "[ERROR] Build not ready or no artifact available" -ForegroundColor Red
        Write-Host "[INFO] Build status: $($buildInfo.status)" -ForegroundColor Yellow
    }
} else {
    # List recent builds and let user choose
    Write-Host "[INFO] Fetching recent builds..." -ForegroundColor Yellow
    Write-Host ""
    
    eas build:list --platform android --limit 5
    
    Write-Host ""
    Write-Host "[TIP] To download a build, use:" -ForegroundColor Cyan
    Write-Host "      ./download-apk.ps1 -buildId <build-id>" -ForegroundColor Gray
    Write-Host ""
}
