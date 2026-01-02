# Upload Backend Code to VPS Script
# Uploads local backend to /root/baotienweb-api on VPS

param(
    [string]$VpsHost = "103.200.20.100",
    [string]$VpsUser = "root",
    [string]$VpsPath = "/root/baotienweb-api",
    [string]$LocalPath = ".\BE-baotienweb.cloud"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload Backend to VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local: $LocalPath" -ForegroundColor Gray
Write-Host "VPS: $VpsUser@$VpsHost:$VpsPath" -ForegroundColor Gray
Write-Host ""

# Kiểm tra local folder
if (-not (Test-Path $LocalPath)) {
    Write-Host "❌ Error: $LocalPath not found" -ForegroundColor Red
    exit 1
}

Write-Host "[1/7] Uploading source code (src/)..." -ForegroundColor Yellow
scp -r "$LocalPath\src" "${VpsUser}@${VpsHost}:$VpsPath/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload src/ failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ src/ uploaded" -ForegroundColor Green
Write-Host ""

Write-Host "[2/7] Uploading Prisma schema..." -ForegroundColor Yellow
scp -r "$LocalPath\prisma" "${VpsUser}@${VpsHost}:$VpsPath/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload prisma/ failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ prisma/ uploaded" -ForegroundColor Green
Write-Host ""

Write-Host "[3/7] Uploading package.json..." -ForegroundColor Yellow
scp "$LocalPath\package.json" "${VpsUser}@${VpsHost}:$VpsPath/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload package.json failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ package.json uploaded" -ForegroundColor Green
Write-Host ""

Write-Host "[4/7] Uploading tsconfig.json..." -ForegroundColor Yellow
scp "$LocalPath\tsconfig.json" "${VpsUser}@${VpsHost}:$VpsPath/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload tsconfig.json failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ tsconfig.json uploaded" -ForegroundColor Green
Write-Host ""

Write-Host "[5/7] Uploading nest-cli.json..." -ForegroundColor Yellow
scp "$LocalPath\nest-cli.json" "${VpsUser}@${VpsHost}:$VpsPath/" 2>$null
Write-Host "✅ nest-cli.json uploaded (if exists)" -ForegroundColor Green
Write-Host ""

Write-Host "[6/7] Installing dependencies on VPS..." -ForegroundColor Yellow
ssh $VpsUser@$VpsHost "cd $VpsPath && npm install"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "[7/7] Building backend on VPS..." -ForegroundColor Yellow
ssh $VpsUser@$VpsHost "cd $VpsPath && npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ UPLOAD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Start PM2 on VPS" -ForegroundColor Cyan
Write-Host "  ssh root@$VpsHost" -ForegroundColor Gray
Write-Host "  cd $VpsPath" -ForegroundColor Gray
Write-Host "  pm2 start dist/main.js --name baotienweb-api" -ForegroundColor Gray
Write-Host "  pm2 save" -ForegroundColor Gray
Write-Host "  pm2 logs baotienweb-api" -ForegroundColor Gray
Write-Host ""
