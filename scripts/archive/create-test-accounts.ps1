# Tạo và lưu test account

$API_BASE = "https://baotienweb.cloud/api/v1"

Write-Host "Creating fresh test accounts..." -ForegroundColor Cyan

$accounts = @(
    @{ email = "client.test@demo.com"; password = "Test123456"; name = "Client Demo"; role = "CLIENT" }
    @{ email = "engineer.test@demo.com"; password = "Test123456"; name = "Engineer Demo"; role = "ENGINEER" }
    @{ email = "admin.test@demo.com"; password = "Test123456"; name = "Admin Demo"; role = "ADMIN" }
)

$successfulAccounts = @()

foreach ($account in $accounts) {
    Write-Host "`nCreating: $($account.email)" -ForegroundColor Yellow
    
    try {
        $body = $account | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$API_BASE/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop

        Write-Host "SUCCESS! User ID: $($response.user.id)" -ForegroundColor Green
        
        $successfulAccounts += @{
            email = $account.email
            password = $account.password
            role = $account.role
            userId = $response.user.id
        }
        
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "Account already exists" -ForegroundColor Gray
            $successfulAccounts += @{
                email = $account.email
                password = $account.password
                role = $account.role
                userId = "existing"
            }
        } else {
            Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   TEST ACCOUNTS READY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

foreach ($acc in $successfulAccounts) {
    Write-Host "`n$($acc.role):" -ForegroundColor Yellow
    Write-Host "  Email:    $($acc.email)" -ForegroundColor White
    Write-Host "  Password: $($acc.password)" -ForegroundColor White
}

# Save to file
$successfulAccounts | ConvertTo-Json | Out-File "test-accounts.json"
Write-Host "`nSaved to: test-accounts.json" -ForegroundColor Cyan
