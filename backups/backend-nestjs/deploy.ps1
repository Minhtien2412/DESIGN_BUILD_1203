# Deployment script for baotienweb.cloud (PowerShell)
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment to baotienweb.cloud..." -ForegroundColor Green

# Configuration
$SERVER = "baotienweb.cloud"
$USER = "root"
$REMOTE_DIR = "/var/www/construction-map-backend"
$APP_NAME = "construction-map-api"

Write-Host "📦 Building application locally..." -ForegroundColor Yellow
npm run build

Write-Host "📤 Uploading files to server..." -ForegroundColor Yellow
# Use rsync via WSL or install cwRsync for Windows
# Alternative: Use SCP or WinSCP
Write-Host "⚠️  Please use an SCP client to upload files to ${USER}@${SERVER}:${REMOTE_DIR}" -ForegroundColor Red
Write-Host "   Exclude: node_modules, .git, dist, .env" -ForegroundColor Red

Write-Host ""
Write-Host "🔧 Manual steps on server:" -ForegroundColor Yellow
Write-Host "1. SSH to server: ssh ${USER}@${SERVER}" -ForegroundColor Cyan
Write-Host "2. Navigate to directory: cd ${REMOTE_DIR}" -ForegroundColor Cyan
Write-Host "3. Install dependencies: npm install --production" -ForegroundColor Cyan
Write-Host "4. Copy env: cp .env.example .env" -ForegroundColor Cyan
Write-Host "5. Edit env: nano .env" -ForegroundColor Cyan
Write-Host "6. Build: npm run build" -ForegroundColor Cyan
Write-Host "7. Run migrations: npm run migration:run" -ForegroundColor Cyan
Write-Host "8. Start PM2: pm2 start dist/main.js --name ${APP_NAME}" -ForegroundColor Cyan
Write-Host "9. Save PM2: pm2 save" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Check deployment guide in DEPLOYMENT_GUIDE.md for full instructions" -ForegroundColor Green
