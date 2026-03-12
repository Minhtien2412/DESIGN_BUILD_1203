# Build APK Tối Ưu - Chỉ Source Code App
# Loại bỏ tất cả file không cần thiết

Write-Host "🚀 Chuẩn bị build APK tối ưu..." -ForegroundColor Cyan
Write-Host ""

# Kiểm tra kích thước hiện tại
Write-Host "📊 Kích thước hiện tại:" -ForegroundColor Yellow
$currentSize = (Get-ChildItem -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
Write-Host "   Total: $([math]::Round($currentSize, 2)) GB" -ForegroundColor White
Write-Host ""

# Backup folders sẽ xóa tạm thời (nếu muốn)
Write-Host "⚠️  Sẽ XÓA TẠM THỜI các folder sau để giảm kích thước:" -ForegroundColor Red
Write-Host "   • _archived (7.7GB)"
Write-Host "   • assets/videos (nếu có)"
Write-Host "   • perfex_crm (131MB)"
Write-Host "   • server (99MB)"
Write-Host "   • backend-implementation (29MB)"
Write-Host "   • .git (git history)"
Write-Host ""

$confirm = Read-Host "Tiếp tục? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Đã hủy" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🗑️  Đang xóa folders không cần thiết..." -ForegroundColor Yellow

# Xóa folders lớn
$foldersToRemove = @(
    "_archived",
    "perfex_crm",
    "server",
    "backend-implementation",
    "android",
    ".git",
    "docs"
)

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        Write-Host "   Xóa $folder..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
    }
}

# Xóa videos trong assets (giữ lại icons)
if (Test-Path "assets/videos") {
    Write-Host "   Xóa assets/videos..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "assets/videos" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "✅ Đã xóa xong!" -ForegroundColor Green
Write-Host ""

# Kiểm tra kích thước sau khi xóa
Write-Host "📊 Kích thước sau khi tối ưu:" -ForegroundColor Yellow
$newSize = (Get-ChildItem -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
Write-Host "   Total: $([math]::Round($newSize, 2)) GB" -ForegroundColor White
$saved = $currentSize - $newSize
Write-Host "   Đã giảm: $([math]::Round($saved, 2)) GB" -ForegroundColor Green
Write-Host ""

# Clean cache
Write-Host "🧹 Xóa cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host ""

# Build
Write-Host "🚀 Bắt đầu build APK..." -ForegroundColor Cyan
Write-Host ""
eas build --profile preview --platform android --clear-cache

Write-Host ""
Write-Host "✅ Done! Check terminal output cho link download APK" -ForegroundColor Green
