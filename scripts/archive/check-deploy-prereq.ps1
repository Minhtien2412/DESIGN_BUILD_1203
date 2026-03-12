# =============================================
# Diagnostic Script - Check Deploy Prerequisites
# =============================================

Write-Host "`n[DIAGNOSTIC] Checking deployment prerequisites..." -ForegroundColor Cyan

# Configuration
$VPS_HOST = "baotienweb.cloud"
$VPS_USER = "root"
$PROJECT_PATH = "/var/www/baotienweb.cloud/BE-baotienweb.cloud"

$allChecks = @()

# Check 1: SSH Connection
Write-Host "`n[CHECK 1] SSH Connection..." -ForegroundColor Yellow
try {
    $result = ssh -q ${VPS_USER}@${VPS_HOST} "echo Connected" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] SSH connection successful" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "  [FAIL] SSH connection failed" -ForegroundColor Red
        Write-Host "  Error: $result" -ForegroundColor Red
        $allChecks += $false
    }
} catch {
    Write-Host "  [FAIL] SSH not available or configured" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    $allChecks += $false
}

# Check 2: Local Backend Files
Write-Host "`n[CHECK 2] Local Backend Files..." -ForegroundColor Yellow
$requiredFiles = @(
    "BE-baotienweb.cloud\src\call\call.service.ts",
    "BE-baotienweb.cloud\src\call\call.gateway.ts"
)

$filesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] Found: $file" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Missing: $file" -ForegroundColor Red
        $filesExist = $false
    }
}
$allChecks += $filesExist

# Check 3: Remote Project Directory
Write-Host "`n[CHECK 3] Remote Project Directory..." -ForegroundColor Yellow
try {
    $result = ssh ${VPS_USER}@${VPS_HOST} "ls -la $PROJECT_PATH/src/call/" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Remote directory exists" -ForegroundColor Green
        Write-Host "  Files in remote call directory:" -ForegroundColor Gray
        Write-Host "  $result" -ForegroundColor Gray
        $allChecks += $true
    } else {
        Write-Host "  [FAIL] Remote directory not found" -ForegroundColor Red
        Write-Host "  Error: $result" -ForegroundColor Red
        $allChecks += $false
    }
} catch {
    Write-Host "  [FAIL] Cannot check remote directory" -ForegroundColor Red
    $allChecks += $false
}

# Check 4: PM2 Status
Write-Host "`n[CHECK 4] PM2 Application Status..." -ForegroundColor Yellow
try {
    $result = ssh ${VPS_USER}@${VPS_HOST} "pm2 list | grep baotienweb-api" 2>&1
    if ($result -match "online") {
        Write-Host "  [OK] Application is running" -ForegroundColor Green
        $allChecks += $true
    } elseif ($result -match "stopped") {
        Write-Host "  [WARN] Application is stopped" -ForegroundColor Yellow
        $allChecks += $true
    } else {
        Write-Host "  [FAIL] Application not found in PM2" -ForegroundColor Red
        Write-Host "  Output: $result" -ForegroundColor Gray
        $allChecks += $false
    }
} catch {
    Write-Host "  [FAIL] Cannot check PM2 status" -ForegroundColor Red
    $allChecks += $false
}

# Check 5: Node & NPM on VPS
Write-Host "`n[CHECK 5] Node.js & NPM on VPS..." -ForegroundColor Yellow
try {
    $nodeVersion = ssh ${VPS_USER}@${VPS_HOST} "node --version" 2>&1
    $npmVersion = ssh ${VPS_USER}@${VPS_HOST} "npm --version" 2>&1
    
    if ($nodeVersion -match "v\d+\.\d+\.\d+") {
        Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
        Write-Host "  [OK] NPM: $npmVersion" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "  [FAIL] Node.js not found" -ForegroundColor Red
        $allChecks += $false
    }
} catch {
    Write-Host "  [FAIL] Cannot check Node.js version" -ForegroundColor Red
    $allChecks += $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
$passedChecks = ($allChecks | Where-Object { $_ -eq $true }).Count
$totalChecks = $allChecks.Count

if ($passedChecks -eq $totalChecks) {
    Write-Host "[SUCCESS] All checks passed ($passedChecks/$totalChecks)" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nYou can proceed with deployment:" -ForegroundColor White
    Write-Host "  .\deploy-backend-webrtc.ps1" -ForegroundColor Cyan
} else {
    Write-Host "[WARNING] Some checks failed ($passedChecks/$totalChecks)" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "`nRecommended actions:" -ForegroundColor White
    
    if (-not $allChecks[0]) {
        Write-Host "`n1. Fix SSH connection:" -ForegroundColor Cyan
        Write-Host "   - Check SSH key: ~\.ssh\id_rsa" -ForegroundColor Gray
        Write-Host "   - Test manually: ssh root@baotienweb.cloud" -ForegroundColor Gray
        Write-Host "   - Or use password: ssh -o PreferredAuthentications=password root@baotienweb.cloud" -ForegroundColor Gray
    }
    
    if (-not $allChecks[1]) {
        Write-Host "`n2. Backend files missing locally:" -ForegroundColor Cyan
        Write-Host "   - Ensure you're in correct directory" -ForegroundColor Gray
        Write-Host "   - Check: Test-Path BE-baotienweb.cloud\src\call\" -ForegroundColor Gray
    }
    
    if (-not $allChecks[2]) {
        Write-Host "`n3. Remote directory issue:" -ForegroundColor Cyan
        Write-Host "   - Verify project path: $PROJECT_PATH" -ForegroundColor Gray
        Write-Host "   - SSH and check: cd /var/www/baotienweb.cloud/" -ForegroundColor Gray
    }
    
    Write-Host "`n4. Alternative: Manual deployment" -ForegroundColor Cyan
    Write-Host "   ssh root@baotienweb.cloud" -ForegroundColor Gray
    Write-Host "   cd $PROJECT_PATH" -ForegroundColor Gray
    Write-Host "   # Copy files with WinSCP or Git pull" -ForegroundColor Gray
    Write-Host "   npm run build" -ForegroundColor Gray
    Write-Host "   pm2 restart baotienweb-api" -ForegroundColor Gray
}

Write-Host ""
