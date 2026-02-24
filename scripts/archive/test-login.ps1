# Quick Test Login Script
# Test đăng nhập với dữ liệu mẫu từ backend

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🧪 QUICK TEST LOGIN - baotienweb.cloud" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$API_BASE = "https://baotienweb.cloud/api/v1"

# Test accounts
$accounts = @{
    "1" = @{
        email = "testuser9139@test.com"
        password = "password123"
        role = "CLIENT"
        description = "Test User - Khách hàng"
    }
    "2" = @{
        email = "engineer@test.com"
        password = "password123"
        role = "ENGINEER"
        description = "Test Engineer - Kỹ sư"
    }
    "3" = @{
        email = "admin@test.com"
        password = "password123"
        role = "ADMIN"
        description = "Test Admin - Quản trị"
    }
}

Write-Host "📋 Test Accounts:" -ForegroundColor Yellow
Write-Host "   1. testuser9139@test.com (CLIENT) ✅ Verified"
Write-Host "   2. engineer@test.com (ENGINEER)"
Write-Host "   3. admin@test.com (ADMIN)"
Write-Host ""

$choice = Read-Host "Chọn account (1-3) hoặc Enter để dùng account 1"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

$account = $accounts[$choice]
if (-not $account) {
    Write-Host "❌ Invalid choice!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔐 Đang đăng nhập..." -ForegroundColor Yellow
Write-Host "   Email: $($account.email)" -ForegroundColor White
Write-Host "   Role: $($account.role)" -ForegroundColor White
Write-Host ""

# Prepare request body
$body = @{
    email = $account.email
    password = $account.password
} | ConvertTo-Json

try {
    # Login request
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 User Info:" -ForegroundColor Yellow
    Write-Host "   ID: $($response.user.id)" -ForegroundColor White
    Write-Host "   Email: $($response.user.email)" -ForegroundColor White
    Write-Host "   Name: $($response.user.name)" -ForegroundColor White
    Write-Host "   Role: $($response.user.role)" -ForegroundColor White
    Write-Host "   Active: $($response.user.isActive)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🔑 Tokens:" -ForegroundColor Yellow
    $accessTokenPreview = $response.accessToken.Substring(0, [Math]::Min(50, $response.accessToken.Length))
    Write-Host "   Access Token: $accessTokenPreview..." -ForegroundColor Gray
    Write-Host "   Length: $($response.accessToken.Length) chars" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "📱 Copy credentials cho app:" -ForegroundColor Yellow
    Write-Host "   Email: $($account.email)" -ForegroundColor Cyan
    Write-Host "   Password: $($account.password)" -ForegroundColor Cyan
    Write-Host ""
    
    # Save to file for easy access
    $credentials = @{
        email = $account.email
        password = $account.password
        role = $account.role
        description = $account.description
        tested = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        accessToken = $response.accessToken
        userId = $response.user.id
        userName = $response.user.name
    } | ConvertTo-Json -Depth 10
    
    $credentials | Out-File -FilePath "test-login-credentials.json" -Encoding UTF8
    Write-Host "💾 Đã lưu credentials vào: test-login-credentials.json" -ForegroundColor Green
    
} catch {
    Write-Host "❌ LOGIN FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Suggestions:" -ForegroundColor Yellow
    Write-Host "   1. Check internet connection" -ForegroundColor White
    Write-Host "   2. Verify backend is running: https://baotienweb.cloud/api/v1/health" -ForegroundColor White
    Write-Host "   3. Account might not exist yet (only testuser9139 is verified)" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
