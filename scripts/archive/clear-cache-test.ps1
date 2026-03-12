#!/usr/bin/env pwsh
# ============================================
# CLEAR CACHE & TEST SCRIPT
# ============================================
# Xóa toàn bộ cache và restart app để test
# notifications chỉ hiển thị ở header (không ở tab bar)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CLEAR CACHE & TEST NOTIFICATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/5] Stopping Expo server..." -ForegroundColor Yellow
# Tìm và kill process expo
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
}

Write-Host "✓ Expo server stopped" -ForegroundColor Green

Write-Host "`n[2/5] Clearing Metro bundler cache..." -ForegroundColor Yellow
if (Test-Path ".\.expo") {
    Remove-Item -Path ".\.expo" -Recurse -Force
    Write-Host "✓ .expo folder deleted" -ForegroundColor Green
}

if (Test-Path ".\node_modules\.cache") {
    Remove-Item -Path ".\node_modules\.cache" -Recurse -Force
    Write-Host "✓ node_modules/.cache deleted" -ForegroundColor Green
}

Write-Host "`n[3/5] Clearing watchman cache..." -ForegroundColor Yellow
watchman watch-del-all 2>&1 | Out-Null
Write-Host "✓ Watchman cache cleared" -ForegroundColor Green

Write-Host "`n[4/5] Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "✓ npm cache cleared" -ForegroundColor Green

Write-Host "`n[5/5] Starting fresh Expo server..." -ForegroundColor Yellow
Write-Host ""

# Display changes
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  CHANGES APPLIED" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "✓ Tab bar: Removed notifications tab" -ForegroundColor Green
Write-Host "  → Only 4 tabs: Trang chủ | Home XD | Dự án | Cá nhân" -ForegroundColor White
Write-Host ""
Write-Host "✓ Notifications: Header only" -ForegroundColor Green
Write-Host "  → Bell icon with badge in header" -ForegroundColor White
Write-Host "  → Navigate to /notifications page" -ForegroundColor White
Write-Host ""
Write-Host "✓ Center FAB: Quick actions" -ForegroundColor Green
Write-Host "  → Add button opens action sheet" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[ ] 1. Tab bar shows only 4 tabs" -ForegroundColor Yellow
Write-Host "[ ] 2. No notifications tab at bottom" -ForegroundColor Yellow
Write-Host "[ ] 3. Header bell icon works" -ForegroundColor Yellow
Write-Host "[ ] 4. Bell badge shows unread count" -ForegroundColor Yellow
Write-Host "[ ] 5. Center FAB opens quick actions" -ForegroundColor Yellow
Write-Host "[ ] 6. All animations smooth" -ForegroundColor Yellow
Write-Host ""

Write-Host "Starting Expo with clean cache..." -ForegroundColor Green
Write-Host ""

# Start expo with clear cache
npx expo start --clear
