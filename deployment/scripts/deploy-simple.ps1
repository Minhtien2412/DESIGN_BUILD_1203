# Simple Deploy Script for Backend
# VPS: baotienweb.cloud (103.200.20.100)

$VPS_HOST = "root@103.200.20.100"
$BACKEND_LOCAL = "C:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud"

Write-Host "=============================================="
Write-Host "DEPLOYING BACKEND TO VPS" -ForegroundColor Cyan
Write-Host "=============================================="

# Step 1: Create backup and archive
Write-Host "Creating backend archive..." -ForegroundColor Yellow
$backendZip = "$env:TEMP\backend-deploy.zip"
if (Test-Path $backendZip) { Remove-Item $backendZip -Force }

Compress-Archive -Path @(
    "$BACKEND_LOCAL\src",
    "$BACKEND_LOCAL\prisma",
    "$BACKEND_LOCAL\package.json",
    "$BACKEND_LOCAL\package-lock.json",
    "$BACKEND_LOCAL\tsconfig.json",
    "$BACKEND_LOCAL\tsconfig.build.json",
    "$BACKEND_LOCAL\nest-cli.json"
) -DestinationPath $backendZip -Force

Write-Host "Archive created: $backendZip" -ForegroundColor Green

# Step 2: Upload to VPS
Write-Host ""
Write-Host "Uploading to VPS..." -ForegroundColor Yellow
scp $backendZip "${VPS_HOST}:/tmp/backend-deploy.zip"

if ($LASTEXITCODE -ne 0) {
    Write-Host "SCP upload failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Upload completed!" -ForegroundColor Green

# Step 3: Deploy on VPS
Write-Host ""
Write-Host "Deploying on VPS..." -ForegroundColor Yellow

$deployScript = @'
#!/bin/bash
set -e

cd /var/www/baotienweb-backend

# Backup current version
echo "Creating backup..."
cp -r src src_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Extract new code
echo "Extracting new code..."
unzip -o /tmp/backend-deploy.zip -d /tmp/backend-extract
cp -r /tmp/backend-extract/* .
rm -rf /tmp/backend-deploy.zip /tmp/backend-extract

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build
echo "Building..."
npm run build

# Restart PM2
echo "Restarting PM2..."
pm2 restart baotienweb-api || pm2 start dist/main.js --name baotienweb-api

echo ""
echo "=== DEPLOYMENT COMPLETED ==="
pm2 status
'@

ssh $VPS_HOST $deployScript

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=============================================="
    Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=============================================="
    Write-Host ""
    Write-Host "Backend URL: https://api.baotienweb.cloud" -ForegroundColor Cyan
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}
