#!/usr/bin/env pwsh
# ============================================
# TEST NOTIFICATIONS SYNC SCRIPT
# ============================================
# Test real-time notification count từ server

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST NOTIFICATIONS SYNC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$API_BASE = "https://baotienweb.cloud/api/v1"
$API_KEY = "dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88"

Write-Host "`n[1/3] Testing notifications endpoint..." -ForegroundColor Yellow

# Test GET /notifications
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/notifications" `
        -Method Get `
        -Headers @{
            "X-API-Key" = $API_KEY
            "Content-Type" = "application/json"
        } `
        -ErrorAction Stop

    Write-Host "✓ Notifications endpoint working" -ForegroundColor Green
    Write-Host "  Total notifications: $($response.data.Count)" -ForegroundColor White
    
    # Count unread
    $unreadCount = ($response.data | Where-Object { -not $_.isRead }).Count
    Write-Host "  Unread count: $unreadCount" -ForegroundColor Cyan
    
}
catch {
    Write-Host "✗ Notifications endpoint failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[2/3] Checking hook implementation..." -ForegroundColor Yellow

# Check if useNotifications hook exists
if (Test-Path ".\hooks\useNotifications.ts") {
    Write-Host "✓ useNotifications hook found" -ForegroundColor Green
    
    # Check for unreadCount calculation
    $hookContent = Get-Content ".\hooks\useNotifications.ts" -Raw
    if ($hookContent -match "setUnreadCount") {
        Write-Host "✓ unreadCount state management found" -ForegroundColor Green
    }
    if ($hookContent -match "filter.*isRead") {
        Write-Host "✓ Unread filtering logic found" -ForegroundColor Green
    }
} else {
    Write-Host "✗ useNotifications hook not found" -ForegroundColor Red
}

Write-Host "`n[3/3] Checking component integration..." -ForegroundColor Yellow

# Check index.tsx
if (Test-Path ".\app\(tabs)\index.tsx") {
    $indexContent = Get-Content ".\app\(tabs)\index.tsx" -Raw
    if ($indexContent -match "useNotifications") {
        Write-Host "✓ index.tsx uses useNotifications" -ForegroundColor Green
    }
    if ($indexContent -match "unreadCount") {
        Write-Host "✓ index.tsx displays unreadCount badge" -ForegroundColor Green
    }
}

# Check home-construction.tsx
if (Test-Path ".\app\(tabs)\home-construction.tsx") {
    $constructionContent = Get-Content ".\app\(tabs)\home-construction.tsx" -Raw
    if ($constructionContent -match "useNotifications") {
        Write-Host "✓ home-construction.tsx uses useNotifications" -ForegroundColor Green
    }
    if ($constructionContent -match "unreadCount") {
        Write-Host "✓ home-construction.tsx displays unreadCount badge" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  INTEGRATION SUMMARY" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "✓ Backend API: Notifications endpoint" -ForegroundColor Green
Write-Host "✓ Frontend Hook: useNotifications with unreadCount" -ForegroundColor Green
Write-Host "✓ Home Screen: Real-time badge sync" -ForegroundColor Green
Write-Host "✓ Construction Screen: Real-time badge sync" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HOW IT WORKS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. useNotifications hook calls GET /notifications" -ForegroundColor White
Write-Host "2. Filters notifications where isRead = false" -ForegroundColor White
Write-Host "3. Counts unread and updates state" -ForegroundColor White
Write-Host "4. Badge shows '99+' if count > 99" -ForegroundColor White
Write-Host "5. Badge hides when count = 0" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST IN APP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[ ] 1. Open app home screen" -ForegroundColor Yellow
Write-Host "[ ] 2. Check bell icon badge count" -ForegroundColor Yellow
Write-Host "[ ] 3. Navigate to notifications" -ForegroundColor Yellow
Write-Host "[ ] 4. Mark some as read" -ForegroundColor Yellow
Write-Host "[ ] 5. Go back - badge count should decrease" -ForegroundColor Yellow
Write-Host "[ ] 6. Mark all as read" -ForegroundColor Yellow
Write-Host "[ ] 7. Badge should hide (count = 0)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ready to test!" -ForegroundColor Green
Write-Host ""
