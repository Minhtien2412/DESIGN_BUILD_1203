# ============================================================================
# Test All Login Accounts - baotienweb.cloud/api/v1
# Quick test script for all backend credentials
# ============================================================================

$API_BASE = "https://baotienweb.cloud/api/v1"
$ENDPOINT = "$API_BASE/auth/login"

# Test accounts
$accounts = @(
    @{
        Name = "ADMIN (Chính)"
        Email = "admin2026@baotienweb.cloud"
        Password = "Admin@2026!"
        Role = "ADMIN"
        Icon = "👑"
    },
    @{
        Name = "ADMIN (Demo)"
        Email = "admin.test@demo.com"
        Password = "Test123456"
        Role = "ADMIN"
        Icon = "🔑"
    },
    @{
        Name = "CLIENT"
        Email = "client.test@demo.com"
        Password = "Test123456"
        Role = "CLIENT"
        Icon = "👤"
    },
    @{
        Name = "ENGINEER"
        Email = "engineer.test@demo.com"
        Password = "Test123456"
        Role = "ENGINEER"
        Icon = "👷"
    },
    @{
        Name = "STAFF (Perfex)"
        Email = "staff@thietkeresort.com"
        Password = "demo123456"
        Role = "STAFF"
        Icon = "👔"
    },
    @{
        Name = "CUSTOMER (Perfex)"
        Email = "customer@company.com"
        Password = "demo123456"
        Role = "CUSTOMER"
        Icon = "🏢"
    }
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🧪 TEST ALL LOGIN ACCOUNTS" -ForegroundColor Cyan
Write-Host "Backend: $API_BASE" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$successCount = 0
$failCount = 0
$results = @()

foreach ($account in $accounts) {
    Write-Host "Testing: $($account.Icon) $($account.Name)" -ForegroundColor Yellow
    Write-Host "  Email: $($account.Email)" -ForegroundColor Gray
    
    try {
        $body = @{
            email = $account.Email
            password = $account.Password
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri $ENDPOINT `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 10

        if ($response.accessToken) {
            Write-Host "  ✅ SUCCESS" -ForegroundColor Green
            Write-Host "  User ID: $($response.user.id)" -ForegroundColor Gray
            Write-Host "  Role: $($response.user.role)" -ForegroundColor Gray
            $successCount++
            
            $results += @{
                Account = $account.Name
                Status = "✅ Success"
                UserId = $response.user.id
                Role = $response.user.role
                Token = $response.accessToken.Substring(0, 30) + "..."
            }
        } else {
            Write-Host "  ❌ FAILED - No token returned" -ForegroundColor Red
            $failCount++
            
            $results += @{
                Account = $account.Name
                Status = "❌ Failed"
                Error = "No token"
            }
        }
    }
    catch {
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
        
        $results += @{
            Account = $account.Name
            Status = "❌ Failed"
            Error = $_.Exception.Message
        }
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500
}

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($accounts.Count)" -ForegroundColor White
Write-Host "✅ Passed: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host ""

# Detailed Results Table
Write-Host "DETAILED RESULTS:" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Gray

foreach ($result in $results) {
    if ($result.Status -like "*Success*") {
        Write-Host "$($result.Account):" -ForegroundColor White
        Write-Host "  Status: $($result.Status)" -ForegroundColor Green
        Write-Host "  User ID: $($result.UserId)" -ForegroundColor Gray
        Write-Host "  Role: $($result.Role)" -ForegroundColor Gray
    } else {
        Write-Host "$($result.Account):" -ForegroundColor White
        Write-Host "  Status: $($result.Status)" -ForegroundColor Red
        Write-Host "  Error: $($result.Error)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "================================================`n" -ForegroundColor Cyan

# Ask if user wants to test registration
$testRegister = Read-Host "Do you want to test REGISTER endpoint? (Y/N)"

if ($testRegister -eq "Y" -or $testRegister -eq "y") {
    Write-Host "`n🧪 Testing REGISTER endpoint..." -ForegroundColor Yellow
    
    $randomNum = Get-Random -Minimum 1000 -Maximum 9999
    $registerBody = @{
        email = "testuser$randomNum@test.com"
        password = "Test@$randomNum"
        name = "Test User $randomNum"
        role = "CLIENT"
    } | ConvertTo-Json

    try {
        $registerResponse = Invoke-RestMethod -Uri "$API_BASE/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $registerBody

        Write-Host "✅ Registration Successful!" -ForegroundColor Green
        Write-Host "  Email: testuser$randomNum@test.com" -ForegroundColor Gray
        Write-Host "  Password: Test@$randomNum" -ForegroundColor Gray
        Write-Host "  User ID: $($registerResponse.user.id)" -ForegroundColor Gray
        Write-Host "  Role: $($registerResponse.user.role)`n" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Registration Failed" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

Write-Host "✨ All tests completed!" -ForegroundColor Green
