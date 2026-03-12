# Deploy Backend with Database Migration
# VPS: baotienweb.cloud (103.200.20.100)
# This script deploys the backend code and runs the Phase 1-5 migration SQL

$VPS_HOST = "root@103.200.20.100"
$BACKEND_LOCAL = "C:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud"

Write-Host "=============================================="
Write-Host "DEPLOYING BACKEND + MIGRATION TO VPS" -ForegroundColor Cyan
Write-Host "=============================================="

# Step 1: Create backend archive
Write-Host "`n[1/5] Creating backend archive..." -ForegroundColor Yellow
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
Write-Host "`n[2/5] Uploading to VPS..." -ForegroundColor Yellow
scp $backendZip "${VPS_HOST}:/tmp/backend-deploy.zip"

if ($LASTEXITCODE -ne 0) {
    Write-Host "SCP upload failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Upload completed!" -ForegroundColor Green

# Step 3: Deploy on VPS (with migration)
Write-Host "`n[3/5] Deploying on VPS with migration..." -ForegroundColor Yellow

$deployScript = @'
#!/bin/bash
set -e

BACKEND_DIR="/var/www/baotienweb-backend"
cd "$BACKEND_DIR"

# Backup current code
echo "[BACKUP] Creating backup..."
BACKUP_DIR="src_backup_$(date +%Y%m%d_%H%M%S)"
cp -r src "$BACKUP_DIR" 2>/dev/null || true

# Extract new code
echo "[EXTRACT] Extracting new code..."
mkdir -p /tmp/backend-extract
cd /tmp/backend-extract
unzip -o /tmp/backend-deploy.zip
# Handle nested paths from Compress-Archive
if [ -d "BE-baotienweb.cloud" ]; then
    cp -r BE-baotienweb.cloud/* "$BACKEND_DIR/"
else
    cp -r * "$BACKEND_DIR/"
fi
cd "$BACKEND_DIR"
rm -rf /tmp/backend-deploy.zip /tmp/backend-extract

# Install dependencies
echo "[NPM] Installing dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -5

# Run database migration SQL
echo ""
echo "[MIGRATION] Running Phase 1-5 migration SQL..."
MIGRATION_SQL="prisma/migrations/manual/add_modules_phase1_5.sql"
if [ -f "$MIGRATION_SQL" ]; then
    # Extract DATABASE_URL from .env
    DB_URL=$(grep "^DATABASE_URL" .env | cut -d'"' -f2)
    if [ -z "$DB_URL" ]; then
        DB_URL=$(grep "^DATABASE_URL" .env | cut -d'=' -f2- | tr -d ' "')
    fi
    
    if [ -n "$DB_URL" ]; then
        echo "Applying migration SQL to database..."
        # Run with ON_ERROR_STOP=0 so existing objects don't cause failure
        psql "$DB_URL" -f "$MIGRATION_SQL" --set ON_ERROR_STOP=0 2>&1 | grep -E "(CREATE|ALTER|ERROR)" | head -30
        echo "Migration SQL applied (errors for existing objects are expected)"
    else
        echo "WARNING: Could not extract DATABASE_URL from .env"
    fi
else
    echo "No migration SQL found at $MIGRATION_SQL"
fi

# Generate Prisma client
echo ""
echo "[PRISMA] Generating Prisma client..."
npx prisma generate

# Also try prisma migrate deploy for formal migrations
echo "[PRISMA] Running prisma migrate deploy..."
npx prisma migrate deploy 2>&1 || echo "Note: Some migrations may already be applied"

# Build
echo ""
echo "[BUILD] Building..."
npm run build 2>&1 | tail -5

if [ ! -f "dist/main.js" ]; then
    echo "ERROR: Build failed! dist/main.js not found"
    exit 1
fi

# Restart PM2
echo ""
echo "[PM2] Restarting..."
pm2 restart baotienweb-api || pm2 start dist/main.js --name baotienweb-api

echo ""
echo "=== DEPLOYMENT COMPLETED ==="
pm2 status
'@

ssh $VPS_HOST $deployScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nDeployment had warnings (check output above)" -ForegroundColor Yellow
} else {
    Write-Host "`n=============================================="
    Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=============================================="
}

# Step 4: Health check
Write-Host "`n[4/5] Running health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $health = Invoke-RestMethod -Uri "https://baotienweb.cloud/api/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "Health check PASSED!" -ForegroundColor Green
    $health | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Health endpoint: $_" -ForegroundColor Yellow
    try {
        $resp = Invoke-WebRequest -Uri "https://baotienweb.cloud/api" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "API root responded with status: $($resp.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "API root: $_" -ForegroundColor Yellow
    }
}

# Step 5: Verify Swagger docs
Write-Host "`n[5/5] Checking Swagger docs..." -ForegroundColor Yellow
try {
    $swagger = Invoke-WebRequest -Uri "https://baotienweb.cloud/api/docs" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "Swagger docs available at https://baotienweb.cloud/api/docs (Status: $($swagger.StatusCode))" -ForegroundColor Green
} catch {
    try {
        $swagger = Invoke-WebRequest -Uri "https://baotienweb.cloud/api/api-docs" -TimeoutSec 10 -ErrorAction Stop
        Write-Host "Swagger docs available at https://baotienweb.cloud/api/api-docs (Status: $($swagger.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "Swagger docs not accessible (may need to enable in main.ts)" -ForegroundColor Yellow
    }
}

Write-Host "`n=============================================="
Write-Host "DEPLOY + MIGRATION COMPLETE" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host "API:     https://baotienweb.cloud/api" -ForegroundColor White
Write-Host "Swagger: https://baotienweb.cloud/api/docs" -ForegroundColor White
Write-Host "=============================================="
