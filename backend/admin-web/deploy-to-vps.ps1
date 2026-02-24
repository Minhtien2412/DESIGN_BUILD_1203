# Admin Web Deploy Script for Windows PowerShell
# Run: .\deploy-to-vps.ps1

$VPS_HOST = "baotienweb.cloud"
$VPS_USER = "root"
$VPS_PATH = "/var/www/admin-web"
$APP_NAME = "admin-web"

Write-Host "🚀 Starting deployment to $VPS_HOST..." -ForegroundColor Cyan

# Step 1: Build
Write-Host "`n📦 Step 1: Building production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed!" -ForegroundColor Green

# Step 2: Upload files
Write-Host "`n📤 Step 2: Uploading files to VPS..." -ForegroundColor Yellow
Write-Host "Using SCP to transfer files..." -ForegroundColor Gray

# Tạo archive để upload nhanh hơn
Write-Host "Creating temporary archive..." -ForegroundColor Gray
if (Test-Path ".\deploy-temp.zip") {
    Remove-Item ".\deploy-temp.zip"
}

$excludes = @(
    "node_modules",
    ".git",
    ".next\cache",
    ".env.local",
    "deploy-temp.zip",
    "*.log"
)

# Compress files
Compress-Archive -Path ".next", "public", "package.json", "package-lock.json", "next.config.js" `
    -DestinationPath "deploy-temp.zip" -Force

# Upload to VPS
scp "deploy-temp.zip" "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Remove-Item "deploy-temp.zip" -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "✅ Files uploaded!" -ForegroundColor Green

# Step 3: Deploy on VPS
Write-Host "`n🔧 Step 3: Installing dependencies and restarting on VPS..." -ForegroundColor Yellow

$commands = @"
    cd $VPS_PATH
    unzip -o deploy-temp.zip
    rm deploy-temp.zip
    npm install --production --prefer-offline
    
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        pm2 restart $APP_NAME
    else
        pm2 start npm --name $APP_NAME -- start
    fi
    
    pm2 save
    echo 'Deployment completed!'
    pm2 list
"@

ssh "${VPS_USER}@${VPS_HOST}" $commands

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed on VPS!" -ForegroundColor Red
    Remove-Item "deploy-temp.zip" -ErrorAction SilentlyContinue
    exit 1
}

# Cleanup
Remove-Item "deploy-temp.zip" -ErrorAction SilentlyContinue

Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "`n📊 Application Status:" -ForegroundColor Cyan
Write-Host "  - Name: $APP_NAME"
Write-Host "  - URL:  https://$VPS_HOST"
Write-Host "`n📝 Useful commands:" -ForegroundColor Cyan
Write-Host "  - View logs:    ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs $APP_NAME'"
Write-Host "  - Restart app:  ssh ${VPS_USER}@${VPS_HOST} 'pm2 restart $APP_NAME'"
Write-Host "  - Stop app:     ssh ${VPS_USER}@${VPS_HOST} 'pm2 stop $APP_NAME'"
Write-Host ""
