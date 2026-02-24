# Deploy Notifications WebSocket to VPS
# Created: December 19, 2025

Write-Host "🚀 Deploying Notifications WebSocket to VPS..." -ForegroundColor Cyan

$VPS_HOST = "root@baotienweb.cloud"
$VPS_PATH = "/var/www/baotienweb.cloud/BE-baotienweb.cloud"
$LOCAL_BE = "BE-baotienweb.cloud"

# Step 1: Copy updated files to VPS
Write-Host "`n📤 Uploading files..." -ForegroundColor Yellow

scp "${LOCAL_BE}/src/notifications/notifications.gateway.ts" "${VPS_HOST}:${VPS_PATH}/src/notifications/"
scp "${LOCAL_BE}/src/notifications/notifications.module.ts" "${VPS_HOST}:${VPS_PATH}/src/notifications/"
scp "${LOCAL_BE}/src/notifications/notifications.service.ts" "${VPS_HOST}:${VPS_PATH}/src/notifications/"
scp "${LOCAL_BE}/src/app.module.ts" "${VPS_HOST}:${VPS_PATH}/src/"

Write-Host "✅ Files uploaded" -ForegroundColor Green

# Step 2: Rebuild backend on VPS
Write-Host "`n🔨 Rebuilding backend..." -ForegroundColor Yellow

ssh $VPS_HOST @"
cd $VPS_PATH
echo '📦 Installing dependencies...'
npm install --production=false

echo '🏗️  Building...'
npm run build

echo '🔄 Restarting PM2...'
pm2 restart baotienweb-api

echo '📊 Checking status...'
pm2 status
pm2 logs baotienweb-api --lines 20
"@

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "🧪 Test notifications:" -ForegroundColor Cyan
Write-Host "   wss://baotienweb.cloud/notifications" -ForegroundColor White
