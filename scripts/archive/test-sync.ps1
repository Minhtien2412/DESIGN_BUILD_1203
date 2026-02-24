Write-Host "`nTesting Notifications Sync..." -ForegroundColor Cyan

# Test API
try {
    $r = Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/notifications" -Method Get -Headers @{"X-API-Key"="thietke-resort-api-key-2024"}
    Write-Host "OK API: Total=$($r.data.Count)" -ForegroundColor Green
    $unread = ($r.data | Where-Object { -not $_.isRead }).Count
    Write-Host "OK Unread: $unread" -ForegroundColor Cyan
} catch {
    Write-Host "FAIL API" -ForegroundColor Red
}

# Check hook
if (Test-Path ".\hooks\useNotifications.ts") { Write-Host "OK Hook exists" -ForegroundColor Green }

# Check components
$idx = Get-Content ".\app\(tabs)\index.tsx" -Raw
if ($idx -match "useNotifications") { Write-Host "OK index.tsx synced" -ForegroundColor Green }

$con = Get-Content ".\app\(tabs)\home-construction.tsx" -Raw
if ($con -match "useNotifications") { Write-Host "OK home-construction.tsx synced" -ForegroundColor Green }

Write-Host "`nDone!" -ForegroundColor Green
