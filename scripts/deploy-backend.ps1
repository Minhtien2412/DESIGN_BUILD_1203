# Deploy Backend to Production Server
# Usage: .\deploy-backend.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Backend Deployment Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Configuration
$SERVER = "103.200.20.100"
$SSH_USER = "root"
$REMOTE_PATH = "/var/www/baotienweb-api"
$LOCAL_BE_PATH = "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud"

# Step 1: Build locally first to check for errors
Write-Host "`n📦 Step 1: Building backend locally..." -ForegroundColor Yellow
Set-Location $LOCAL_BE_PATH

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npm install
}

# Build
Write-Host "Building TypeScript..." -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 2: Create deployment package
Write-Host "`n📦 Step 2: Creating deployment package..." -ForegroundColor Yellow

$deployDir = "deploy-package"
$deployZip = "deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"

# Clean old deploy directory
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy necessary files
$filesToCopy = @(
    "dist",
    "prisma",
    "package.json",
    "package-lock.json",
    ".env.example"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item -Recurse -Force $file "$deployDir\$file"
        Write-Host "  Copied: $file" -ForegroundColor Gray
    }
}

# Create zip
Compress-Archive -Path "$deployDir\*" -DestinationPath $deployZip -Force
Write-Host "✅ Package created: $deployZip" -ForegroundColor Green

# Step 3: Upload to server
Write-Host "`n📤 Step 3: Upload to server..." -ForegroundColor Yellow
Write-Host "Run these commands manually on your terminal:" -ForegroundColor Cyan

Write-Host @"

# 1. Upload the package:
scp "$LOCAL_BE_PATH\$deployZip" ${SSH_USER}@${SERVER}:/tmp/

# 2. SSH into server:
ssh ${SSH_USER}@${SERVER}

# 3. On server, run:
cd $REMOTE_PATH
cp /tmp/$deployZip .
unzip -o $deployZip

# 4. Install dependencies and restart:
npm ci --production
npx prisma generate
pm2 restart baotienweb-api || pm2 start dist/main.js --name baotienweb-api

# 5. Check health:
curl http://localhost:3000/health

"@ -ForegroundColor White

# Step 4: Cleanup
Write-Host "`n🧹 Cleaning up local files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $deployDir
Write-Host "✅ Cleanup done!" -ForegroundColor Green

Write-Host @"

============================
📋 POST-DEPLOYMENT CHECKLIST
============================
1. ✅ Verify API health: curl https://baotienweb.cloud/api/v1/health
2. ✅ Check PM2 status: pm2 status
3. ✅ View logs: pm2 logs baotienweb-api --lines 50
4. ✅ Test WebSocket: wscat -c wss://baotienweb.cloud/chat

🔗 API Endpoints to test:
- GET  /health
- POST /v1/auth/login
- POST /v1/auth/register
- GET  /v1/conversations
- GET  /v1/notifications

"@ -ForegroundColor Cyan
