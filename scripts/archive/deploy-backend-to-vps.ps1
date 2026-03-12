# Deploy Backend to VPS Script
# Uploads local backend code to VPS and restarts services

param(
    [string]$VpsHost = "103.200.20.100",
    [string]$VpsUser = "root",
    [string]$RemotePath = "/var/www/baotienweb",
    [string]$LocalBackendPath = ".\BE-baotienweb.cloud"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend Deployment to VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "VPS: $VpsHost" -ForegroundColor Gray
Write-Host "Remote Path: $RemotePath" -ForegroundColor Gray
Write-Host "Local Backend: $LocalBackendPath" -ForegroundColor Gray
Write-Host ""

# Kiểm tra local backend folder
if (-not (Test-Path $LocalBackendPath)) {
    Write-Host "❌ Error: Backend folder not found at $LocalBackendPath" -ForegroundColor Red
    exit 1
}

Write-Host "[1/6] Stopping backend on VPS..." -ForegroundColor Yellow
ssh $VpsUser@$VpsHost "pm2 stop all"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Could not stop pm2 processes (maybe not running)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Backend stopped" -ForegroundColor Green
}
Write-Host ""

Write-Host "[2/6] Creating backup of current VPS code..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
ssh $VpsUser@$VpsHost "cd $RemotePath && tar -czf ~/backup_code_$timestamp.tar.gz ." 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup created: ~/backup_code_$timestamp.tar.gz" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Could not create backup (folder may not exist)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "[3/6] Uploading backend files to VPS..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

# Tạo thư mục trên VPS nếu chưa có
ssh $VpsUser@$VpsHost "mkdir -p $RemotePath"

# Upload các file quan trọng (loại bỏ node_modules, dist, .git)
$excludeList = @(
    "node_modules",
    "dist",
    ".git",
    ".env.local",
    "*.log",
    "uploads"
)

# Build exclude arguments for rsync
$excludeArgs = $excludeList | ForEach-Object { "--exclude=$_" }

# Sử dụng scp để upload (hoặc rsync nếu có)
$uploadCommand = "scp -r $($excludeArgs -join ' ') $LocalBackendPath/* $VpsUser@${VpsHost}:$RemotePath/"

# Tạo temp folder để copy files (loại trừ node_modules, dist)
$tempUpload = ".\temp_upload"
if (Test-Path $tempUpload) {
    Remove-Item $tempUpload -Recurse -Force
}
Copy-Item $LocalBackendPath $tempUpload -Recurse

# Xóa các folder không cần thiết
Remove-Item "$tempUpload\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$tempUpload\dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$tempUpload\.git" -Recurse -Force -ErrorAction SilentlyContinue

# Upload
Write-Host "Uploading source code..." -ForegroundColor Gray
scp -r "$tempUpload\*" "${VpsUser}@${VpsHost}:$RemotePath/"

# Cleanup temp
Remove-Item $tempUpload -Recurse -Force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[4/6] Installing dependencies on VPS..." -ForegroundColor Yellow
ssh $VpsUser@$VpsHost "cd $RemotePath && npm install --production"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[5/6] Building backend on VPS..." -ForegroundColor Yellow
ssh $VpsUser@$VpsHost "cd $RemotePath && npm run build"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[6/6] Starting backend with PM2..." -ForegroundColor Yellow
ssh $VpsUser@$VpsHost "cd $RemotePath && pm2 start dist/main.js --name baotienweb-api || pm2 restart baotienweb-api"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend started" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start backend!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verify deployment
Write-Host "Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
ssh $VpsUser@$VpsHost "pm2 list"
Write-Host ""

Write-Host "Testing health endpoint..." -ForegroundColor Yellow
ssh $VpsUser@$VpsHost "curl -s http://localhost:3000/health | head -n 1"
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test API: curl https://baotienweb.cloud/api/v1/health" -ForegroundColor Gray
Write-Host "  2. Check PM2 logs: ssh root@$VpsHost 'pm2 logs'" -ForegroundColor Gray
Write-Host "  3. Monitor: ssh root@$VpsHost 'pm2 monit'" -ForegroundColor Gray
Write-Host ""
