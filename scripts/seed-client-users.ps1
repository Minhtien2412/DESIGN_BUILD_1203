# Seed CLIENT users for projects

$API_BASE = "https://baotienweb.cloud/api/v1"

Write-Host "=== SEEDING CLIENT USERS ===" -ForegroundColor Green

# 5 Client accounts
$clients = @(
    @{email="client.minh@test.com";password="123456";name="Nguyen Van Minh";role="CLIENT"},
    @{email="client.lan@test.com";password="123456";name="Tran Thi Lan";role="CLIENT"},
    @{email="client.tuan@test.com";password="123456";name="Le Van Tuan";role="CLIENT"},
    @{email="client.hong@test.com";password="123456";name="Pham Thi Hong";role="CLIENT"},
    @{email="client.duc@test.com";password="123456";name="Hoang Van Duc";role="CLIENT"}
)

Write-Host "Registering $($clients.Count) CLIENT users...`n" -ForegroundColor Cyan

$created = @()
foreach ($client in $clients) {
    $body = $client | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
        Write-Host "  [OK] Registered: $($client.name) ($($client.email)) - ID: $($response.user.id)" -ForegroundColor Green
        $created += $response.user
    } catch {
        Write-Host "  [FAIL] $($client.email): $_" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 200
}

Write-Host "`n=== COMPLETE ===" -ForegroundColor Green
Write-Host "Created: $($created.Count) CLIENTs" -ForegroundColor White

if ($created.Count -gt 0) {
    $clientIds = $created | ForEach-Object { $_.id }
    Write-Host "CLIENT IDs: $($clientIds -join ', ')" -ForegroundColor Cyan
    
    # Save for use in project seeding
    $clientIds | ConvertTo-Json | Out-File "scripts\_client_ids.json" -Encoding UTF8
    Write-Host "Saved to scripts\_client_ids.json" -ForegroundColor Yellow
}
