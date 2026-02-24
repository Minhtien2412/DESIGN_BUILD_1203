# Get CLIENT users for project seeding

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

# Login
$loginBody = @{email=$ADMIN_EMAIL;password=$ADMIN_PASSWORD} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
$TOKEN = $loginResponse.accessToken
$headers = @{"Authorization" = "Bearer $TOKEN"}

Write-Host "Fetching CLIENT users...`n"

# Get users
$users = Invoke-RestMethod -Uri "$API_BASE/users?limit=100" -Headers $headers
if ($users.data) { $userList = $users.data } else { $userList = $users }

# Filter CLIENTs
$clients = $userList | Where-Object { $_.role -eq 'CLIENT' } | Select-Object -First 10

Write-Host "CLIENT users (first 10):" -ForegroundColor Cyan
$clients | ForEach-Object {
    Write-Host "  ID: $($_.id) - $($_.email) - $($_.name)" -ForegroundColor White
}

Write-Host "`nTotal CLIENTs: $($clients.Count)" -ForegroundColor Green

# Export IDs for script
$clientIds = $clients | Select-Object -First 5 | ForEach-Object { $_.id }
Write-Host "`nFirst 5 CLIENT IDs: $($clientIds -join ', ')" -ForegroundColor Yellow
