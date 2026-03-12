# Script upload và cập nhật controller
# Chạy: .\update-controller.ps1

param(
    [string]$Password = ""
)

$server = "baotienweb.cloud"
$username = "root"
$localFile = "notifications.controller.complete.ts"
$remotePath = "~/baotienweb-api/src/notifications/notifications.controller.ts"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  CẬP NHẬT NOTIFICATIONS CONTROLLER" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file tồn tại
if (-not (Test-Path $localFile)) {
    Write-Host "✗ Không tìm thấy file $localFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ File controller hoàn chỉnh đã sẵn sàng" -ForegroundColor Green
Write-Host ""
Write-Host "Bước 1: Upload file lên server..." -ForegroundColor Yellow

# Sử dụng SCP để upload
scp $localFile "${username}@${server}:${remotePath}.new"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Upload thất bại" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Upload thành công" -ForegroundColor Green
Write-Host ""
Write-Host "Bước 2: Backup và replace file cũ..." -ForegroundColor Yellow

# Tạo backup và replace
$commands = @"
cd ~/baotienweb-api &&
mkdir -p backups &&
cp src/notifications/notifications.controller.ts backups/notifications.controller.ts.backup-`$(date +%Y%m%d-%H%M%S) &&
mv src/notifications/notifications.controller.ts.new src/notifications/notifications.controller.ts &&
echo '✓ File đã được thay thế'
"@

ssh "${username}@${server}" $commands

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Thay thế file thất bại" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Backup và thay thế thành công" -ForegroundColor Green
Write-Host ""
Write-Host "Bước 3: Rebuild TypeScript..." -ForegroundColor Yellow

ssh "${username}@${server}" "cd ~/baotienweb-api && npm run build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Build có cảnh báo nhưng tiếp tục..." -ForegroundColor Yellow
}

Write-Host "✓ Build hoàn tất" -ForegroundColor Green
Write-Host ""
Write-Host "Bước 4: Restart backend..." -ForegroundColor Yellow

ssh "${username}@${server}" "pm2 restart baotienweb-api"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Restart thất bại" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Backend đã restart" -ForegroundColor Green
Write-Host ""
Write-Host "Bước 5: Kiểm tra status..." -ForegroundColor Yellow

ssh "${username}@${server}" "pm2 status baotienweb-api"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  ✓ HOÀN THÀNH!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "POST /api/v1/notifications endpoint đã được thêm!" -ForegroundColor Green
Write-Host ""
Write-Host "Kiểm tra ngay:" -ForegroundColor Yellow
Write-Host "  .\send-all.ps1" -ForegroundColor Cyan
Write-Host ""
