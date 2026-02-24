# ===========================================
# DEPLOY SCRIPT FOR STRAPI CMS & BACKEND
# VPS: baotienweb.cloud (103.200.20.100)
# Run in PowerShell: .\deploy-vps.ps1
# ===========================================

$ErrorActionPreference = "Stop"
$VPS_HOST = "root@103.200.20.100"
$BACKEND_LOCAL = "C:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud"
$STRAPI_LOCAL = "C:\tien\New folder\APP_DESIGN_BUILD05.12.2025\strapi-cms"

Write-Host "=============================================="
Write-Host "🚀 DEPLOYING STRAPI CMS + BACKEND TO VPS" -ForegroundColor Cyan
Write-Host "=============================================="

# Step 1: Deploy Backend
Write-Host ""
Write-Host "📦 Step 1: Deploying Backend Updates..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

# Create zip of backend src folder
$backendZip = "$env:TEMP\backend-src.zip"
if (Test-Path $backendZip) { Remove-Item $backendZip -Force }

Write-Host "Creating backend archive..." -ForegroundColor Gray
Compress-Archive -Path "$BACKEND_LOCAL\src", "$BACKEND_LOCAL\prisma", "$BACKEND_LOCAL\package.json", "$BACKEND_LOCAL\tsconfig.json", "$BACKEND_LOCAL\tsconfig.build.json", "$BACKEND_LOCAL\nest-cli.json" -DestinationPath $backendZip -Force

Write-Host "Uploading to VPS..." -ForegroundColor Gray
scp $backendZip "${VPS_HOST}:/tmp/backend-src.zip"

Write-Host "Extracting and building on VPS..." -ForegroundColor Gray
ssh $VPS_HOST @"
cd /var/www/baotienweb-backend
unzip -o /tmp/backend-src.zip -d /tmp/backend-extract
cp -r /tmp/backend-extract/* .
rm -rf /tmp/backend-src.zip /tmp/backend-extract
npm ci --only=production 2>/dev/null || npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart baotienweb-api
echo '✅ Backend deployed!'
"@

# Step 2: Deploy Strapi
Write-Host ""
Write-Host "📦 Step 2: Deploying Strapi CMS..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

# Build Strapi locally first
Write-Host "Building Strapi locally..." -ForegroundColor Gray
Push-Location $STRAPI_LOCAL
npm run build
Pop-Location

# Create Strapi archive
$strapiZip = "$env:TEMP\strapi-cms.zip"
if (Test-Path $strapiZip) { Remove-Item $strapiZip -Force }

Write-Host "Creating Strapi archive..." -ForegroundColor Gray
$strapiItems = @(
    "$STRAPI_LOCAL\src",
    "$STRAPI_LOCAL\config", 
    "$STRAPI_LOCAL\public",
    "$STRAPI_LOCAL\dist",
    "$STRAPI_LOCAL\package.json",
    "$STRAPI_LOCAL\package-lock.json",
    "$STRAPI_LOCAL\tsconfig.json"
)
$existingItems = $strapiItems | Where-Object { Test-Path $_ }
Compress-Archive -Path $existingItems -DestinationPath $strapiZip -Force

Write-Host "Uploading Strapi to VPS..." -ForegroundColor Gray
scp $strapiZip "${VPS_HOST}:/tmp/strapi-cms.zip"

Write-Host "Setting up Strapi on VPS..." -ForegroundColor Gray
ssh $VPS_HOST @'
# Create directory if not exists
mkdir -p /var/www/strapi-cms
cd /var/www/strapi-cms

# Extract files
unzip -o /tmp/strapi-cms.zip -d /tmp/strapi-extract
cp -r /tmp/strapi-extract/* .
rm -rf /tmp/strapi-cms.zip /tmp/strapi-extract

# Create .env if not exists
if [ ! -f .env ]; then
cat > .env << 'ENVFILE'
HOST=0.0.0.0
PORT=1337
APP_KEYS=toBeModified1,toBeModified2,toBeModified3,toBeModified4
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
BACKEND_API_URL=https://baotienweb.cloud/api/v1
BACKEND_API_TOKEN=strapi-sync-token-secret-change-this
ENVFILE
echo "Created .env file"
fi

# Install dependencies
npm ci --only=production 2>/dev/null || npm install

# Start with PM2
pm2 describe strapi-cms > /dev/null 2>&1 && pm2 restart strapi-cms || pm2 start npm --name "strapi-cms" -- run start
pm2 save

echo '✅ Strapi CMS deployed!'
'@

# Step 3: Configure Nginx
Write-Host ""
Write-Host "🌐 Step 3: Configuring Nginx..." -ForegroundColor Yellow
Write-Host "--------------------------------"

ssh $VPS_HOST @'
# Create Nginx config for Strapi
cat > /etc/nginx/sites-available/strapi-cms << 'NGINXCONF'
server {
    listen 80;
    server_name cms.baotienweb.cloud;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass_request_headers on;
    }
}
NGINXCONF

# Enable site
ln -sf /etc/nginx/sites-available/strapi-cms /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx
echo '✅ Nginx configured!'

# Setup SSL (optional)
if [ ! -f /etc/letsencrypt/live/cms.baotienweb.cloud/fullchain.pem ]; then
    echo '🔐 Setting up SSL...'
    certbot --nginx -d cms.baotienweb.cloud --non-interactive --agree-tos -m admin@baotienweb.cloud || echo '⚠️ SSL failed, run manually: certbot --nginx -d cms.baotienweb.cloud'
fi
'@

Write-Host ""
Write-Host "=============================================="
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=============================================="
Write-Host ""
Write-Host "📍 Strapi CMS: https://cms.baotienweb.cloud/admin" -ForegroundColor Cyan
Write-Host "📍 Backend API: https://baotienweb.cloud/api/v1" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Truy cập https://cms.baotienweb.cloud/admin"
Write-Host "   2. Tạo tài khoản admin Strapi"
Write-Host "   3. Test sync endpoints"
Write-Host ""
