# Quick test script for Construction Progress feature
Write-Host "🏗️  Testing Construction Progress Feature" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check if files exist
Write-Host "1️⃣  Checking files..." -ForegroundColor Yellow
$files = @(
    "app\construction-progress.tsx",
    "components\ui\construction-progress-card.tsx",
    "hooks\useConstructionProgress.ts",
    "CONSTRUCTION_PROGRESS_README.md",
    "CONSTRUCTION_PROGRESS_SUMMARY.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (MISSING)" -ForegroundColor Red
    }
}

# 2. Check imports in home screen
Write-Host ""
Write-Host "2️⃣  Checking home screen integration..." -ForegroundColor Yellow
$indexContent = Get-Content "app\(tabs)\index.tsx" -Raw

if ($indexContent -match "ConstructionProgressCard") {
    Write-Host "   ✅ Card component imported" -ForegroundColor Green
} else {
    Write-Host "   ❌ Card component NOT imported" -ForegroundColor Red
}

if ($indexContent -match "useConstructionProgress") {
    Write-Host "   ✅ Hook imported" -ForegroundColor Green
} else {
    Write-Host "   ❌ Hook NOT imported" -ForegroundColor Red
}

# 3. Check AsyncStorage package
Write-Host ""
Write-Host "3️⃣  Checking dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw

if ($packageJson -match "@react-native-async-storage/async-storage") {
    Write-Host "   ✅ AsyncStorage installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ AsyncStorage NOT installed" -ForegroundColor Red
}

# 4. Count lines of code
Write-Host ""
Write-Host "4️⃣  Code statistics..." -ForegroundColor Yellow
$totalLines = 0
$files | ForEach-Object {
    if (Test-Path $_) {
        $lines = (Get-Content $_ | Measure-Object -Line).Lines
        $totalLines += $lines
        Write-Host "   📄 $_ : $lines lines" -ForegroundColor Cyan
    }
}
Write-Host "   📊 Total: $totalLines lines" -ForegroundColor Magenta

# 5. Manual test checklist
Write-Host ""
Write-Host "📋 Manual Test Checklist:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "Home Screen:" -ForegroundColor Yellow
Write-Host "  [ ] Card hiển thị trên trang chủ"
Write-Host "  [ ] Progress % hiển thị đúng"
Write-Host "  [ ] Số task completed/total đúng"
Write-Host "  [ ] Chạm vào card → navigate sang màn hình chi tiết"
Write-Host ""
Write-Host "Construction Progress Screen:" -ForegroundColor Yellow
Write-Host "  [ ] Header hiển thị đúng"
Write-Host "  [ ] 4 giai đoạn hiển thị đầy đủ"
Write-Host "  [ ] Kanban board với 4 cột"
Write-Host "  [ ] Progress bar cho từng cột"
Write-Host "  [ ] Tasks hiển thị đúng cột"
Write-Host "  [ ] Màu sắc trạng thái đúng"
Write-Host ""
Write-Host "Add Task:" -ForegroundColor Yellow
Write-Host "  [ ] Chạm FAB button (+)"
Write-Host "  [ ] Modal mở lên"
Write-Host "  [ ] Nhập tên task"
Write-Host "  [ ] Chọn giai đoạn"
Write-Host "  [ ] Thêm ghi chú"
Write-Host "  [ ] Submit → task xuất hiện trong cột tương ứng"
Write-Host ""
Write-Host "Update Task:" -ForegroundColor Yellow
Write-Host "  [ ] Chạm vào task card"
Write-Host "  [ ] Modal chi tiết mở"
Write-Host "  [ ] Đổi trạng thái → progress tự động update"
Write-Host "  [ ] Đổi giai đoạn → task chuyển cột"
Write-Host "  [ ] Sửa ghi chú → lưu thành công"
Write-Host ""
Write-Host "Delete Task:" -ForegroundColor Yellow
Write-Host "  [ ] Chọn task"
Write-Host "  [ ] Cuộn xuống dưới modal"
Write-Host "  [ ] Chạm 'Xóa hạng mục'"
Write-Host "  [ ] Confirm → task biến mất"
Write-Host ""
Write-Host "Data Persistence:" -ForegroundColor Yellow
Write-Host "  [ ] Thêm/sửa task"
Write-Host "  [ ] Tắt app"
Write-Host "  [ ] Mở lại → data vẫn còn"
Write-Host ""
Write-Host "Pull to Refresh:" -ForegroundColor Yellow
Write-Host "  [ ] Kéo xuống trên home"
Write-Host "  [ ] Progress card cập nhật"
Write-Host ""
Write-Host "🎯 Quick Test Commands:" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host ""
Write-Host "# TypeScript type check" -ForegroundColor Cyan
Write-Host "npm run typecheck" -ForegroundColor White
Write-Host ""
Write-Host "# Clear cache and restart" -ForegroundColor Cyan
Write-Host "npm run clean:cache" -ForegroundColor White
Write-Host ""
Write-Host "# Check for errors" -ForegroundColor Cyan
Write-Host "npm run lint" -ForegroundColor White
Write-Host ""
Write-Host "✨ Happy Testing!" -ForegroundColor Magenta
Write-Host ""

# Optional: Run typecheck automatically
Write-Host "Run typecheck now? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "Running typecheck..." -ForegroundColor Cyan
    npm run typecheck
}
