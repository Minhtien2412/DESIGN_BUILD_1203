# =============================================
# Deploy Backend WebRTC Fixes to VPS (Windows)
# =============================================

$ErrorActionPreference = "Stop"

Write-Host "`n[DEPLOY] Deploying Backend WebRTC fixes to baotienweb.cloud..." -ForegroundColor Cyan

# Configuration
$VPS_HOST = "baotienweb.cloud"
$VPS_USER = "root"
$PROJECT_PATH = "/var/www/baotienweb.cloud/BE-baotienweb.cloud"
$PM2_APP_NAME = "baotienweb-api"

Write-Host "`n[CHECK] Pre-deployment checks..." -ForegroundColor Yellow

# Test SSH connection
Write-Host "Testing SSH connection..."
try {
    ssh -q ${VPS_USER}@${VPS_HOST} "exit"
    Write-Host "[OK] SSH connection successful" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Cannot connect to VPS. Check your SSH config." -ForegroundColor Red
    exit 1
}

Write-Host "`n[STEP 1] Uploading code changes..." -ForegroundColor Yellow

# Upload modified files
Write-Host "Uploading call.service.ts..."
scp BE-baotienweb.cloud\src\call\call.service.ts ${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/src/call/

Write-Host "Uploading call.gateway.ts..."
scp BE-baotienweb.cloud\src\call\call.gateway.ts ${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/src/call/

Write-Host "[OK] Files uploaded" -ForegroundColor Green

Write-Host "`n[STEP 2] Building on VPS..." -ForegroundColor Yellow

# SSH and run build
$buildScript = @"
set -e
cd $PROJECT_PATH
echo '[NPM] Installing dependencies (if needed)...'
npm install --production=false
echo '[BUILD] Building TypeScript...'
npm run build
echo '[OK] Build complete'
"@

ssh ${VPS_USER}@${VPS_HOST} $buildScript

Write-Host "[OK] Build successful" -ForegroundColor Green

Write-Host "`n[STEP 3] Restarting PM2..." -ForegroundColor Yellow

# Restart PM2
$restartScript = @"
pm2 restart $PM2_APP_NAME
echo 'Waiting for app to start...'
sleep 3
pm2 status $PM2_APP_NAME
echo ''
echo 'Recent logs:'
pm2 logs $PM2_APP_NAME --lines 20 --nostream
"@

ssh ${VPS_USER}@${VPS_HOST} $restartScript

Write-Host "[OK] PM2 restarted" -ForegroundColor Green

Write-Host "`n[STEP 4] Health check..." -ForegroundColor Yellow

Start-Sleep -Seconds 2

# Check API health
Write-Host "Testing API endpoint..."
try {
    $response = Invoke-WebRequest -Uri "https://$VPS_HOST/api/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "[OK] API is responding (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "[WARN] API might not be responding" -ForegroundColor Yellow
    Write-Host "Check logs with: ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs ${PM2_APP_NAME}'"
}

Write-Host "`n========================================"  -ForegroundColor Green
Write-Host "[SUCCESS] Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nNext steps:"
Write-Host "1. Test WebSocket connection:"
Write-Host "   wscat -c wss://$VPS_HOST/call"
Write-Host ""
Write-Host "2. Test signaling flow:"
Write-Host "   - Build development build: npx expo run:android"
Write-Host "   - Install on 2 devices"
Write-Host "   - Test video call between users"
Write-Host ""
Write-Host "3. Monitor logs:"
Write-Host "   ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs ${PM2_APP_NAME}'"
Write-Host ""
Write-Host "4. Setup TURN server (for production):"
Write-Host "   See WEBRTC_BACKEND_FIXES.md section 4"
Write-Host ""
