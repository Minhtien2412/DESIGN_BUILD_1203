# Deploy Script - Upload và deploy lên VPS 103.200.20.100
# Chạy script này từ PowerShell với quyền Administrator

$VPS_IP = "103.200.20.100"
$VPS_USER = "root"
$LOCAL_ZIP = "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud\deploy-complete.zip"
$REMOTE_TMP = "/tmp/deploy-complete.zip"

Write-Host "=== BƯỚC 1: UPLOAD FILE ===" -ForegroundColor Cyan
Write-Host "Đang upload deploy-complete.zip (183MB) lên VPS..."
scp $LOCAL_ZIP "${VPS_USER}@${VPS_IP}:${REMOTE_TMP}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Upload thành công!" -ForegroundColor Green
    
    Write-Host "`n=== BƯỚC 2: SSH VÀ DEPLOY ===" -ForegroundColor Cyan
    Write-Host "Nhấn Enter để SSH vào VPS và chạy deployment..."
    Read-Host
    
    # SSH và chạy deploy commands
    ssh "${VPS_USER}@${VPS_IP}"
} else {
    Write-Host "✗ Upload thất bại. Vui lòng kiểm tra kết nối." -ForegroundColor Red
}
