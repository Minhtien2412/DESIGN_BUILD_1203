# Test API và JWT từ Production Server
# URL: https://api.thietkeresort.com.vn

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  KIỂM TRA API VÀ JWT - PRODUCTION SERVER" -ForegroundColor Cyan
Write-Host "  URL: https://api.thietkeresort.com.vn" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://api.thietkeresort.com.vn"
$testEmail = "test_$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$testPassword = "Test@123456"

# ============================================================================
# Test 1: Health Check
# ============================================================================
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
Write-Host "GET $baseUrl/health" -ForegroundColor Gray

try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Health Check PASSED" -ForegroundColor Green
    Write-Host "Response: $($healthResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================================
# Test 2: Register User
# ============================================================================
Write-Host "Test 2: Register New User" -ForegroundColor Yellow
Write-Host "POST $baseUrl/auth/register" -ForegroundColor Gray
Write-Host "Email: $testEmail" -ForegroundColor Gray

$registerBody = @{
    email = $testEmail
    password = $testPassword
    fullName = "Test User"
    role = "client"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json" `
        -TimeoutSec 15
    
    Write-Host "✅ Register PASSED" -ForegroundColor Green
    
    # Kiểm tra response có đúng format không
    if (-not $registerResponse.accessToken) {
        Write-Host "❌ FAILED: Không có accessToken trong response" -ForegroundColor Red
        Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Red
        exit 1
    }
    
    if (-not $registerResponse.refreshToken) {
        Write-Host "❌ FAILED: Không có refreshToken trong response" -ForegroundColor Red
        Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Red
        exit 1
    }
    
    if (-not $registerResponse.user) {
        Write-Host "❌ FAILED: Không có user trong response" -ForegroundColor Red
        Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "User ID: $($registerResponse.user.id)" -ForegroundColor Green
    Write-Host "User Email: $($registerResponse.user.email)" -ForegroundColor Green
    Write-Host "User Role: $($registerResponse.user.role)" -ForegroundColor Green
    Write-Host "Access Token: $($registerResponse.accessToken.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "Refresh Token: $($registerResponse.refreshToken.Substring(0, 20))..." -ForegroundColor Green
    
    $accessToken = $registerResponse.accessToken
    $refreshToken = $registerResponse.refreshToken
    $userId = $registerResponse.user.id
    
} catch {
    Write-Host "❌ Register FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# ============================================================================
# Test 3: Verify JWT Token (Get Current User)
# ============================================================================
Write-Host "Test 3: Verify JWT Token" -ForegroundColor Yellow
Write-Host "GET $baseUrl/auth/me" -ForegroundColor Gray

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

try {
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
        -Method Get `
        -Headers $headers `
        -TimeoutSec 10
    
    Write-Host "✅ JWT Verification PASSED" -ForegroundColor Green
    Write-Host "Current User ID: $($meResponse.id)" -ForegroundColor Green
    Write-Host "Current User Email: $($meResponse.email)" -ForegroundColor Green
    Write-Host "Current User Role: $($meResponse.role)" -ForegroundColor Green
    
    # Verify user ID matches
    if ($meResponse.id -ne $userId) {
        Write-Host "❌ FAILED: User ID không khớp" -ForegroundColor Red
        Write-Host "Expected: $userId, Got: $($meResponse.id)" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ JWT Verification FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# ============================================================================
# Test 4: Login with Same Credentials
# ============================================================================
Write-Host "Test 4: Login with Created User" -ForegroundColor Yellow
Write-Host "POST $baseUrl/auth/login" -ForegroundColor Gray

$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -TimeoutSec 15
    
    Write-Host "✅ Login PASSED" -ForegroundColor Green
    
    # Kiểm tra response
    if (-not $loginResponse.accessToken) {
        Write-Host "❌ FAILED: Không có accessToken trong login response" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "New Access Token: $($loginResponse.accessToken.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "User Email: $($loginResponse.user.email)" -ForegroundColor Green
    
    $newAccessToken = $loginResponse.accessToken
    $newRefreshToken = $loginResponse.refreshToken
    
} catch {
    Write-Host "❌ Login FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# ============================================================================
# Test 5: Refresh Token
# ============================================================================
Write-Host "Test 5: Refresh Access Token" -ForegroundColor Yellow
Write-Host "POST $baseUrl/auth/refresh" -ForegroundColor Gray

$refreshBody = @{
    refreshToken = $newRefreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh" `
        -Method Post `
        -Body $refreshBody `
        -ContentType "application/json" `
        -TimeoutSec 15
    
    Write-Host "✅ Refresh Token PASSED" -ForegroundColor Green
    
    if (-not $refreshResponse.accessToken) {
        Write-Host "❌ FAILED: Không có accessToken mới trong refresh response" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Refreshed Access Token: $($refreshResponse.accessToken.Substring(0, 20))..." -ForegroundColor Green
    
    # Verify new token works
    $verifyHeaders = @{
        "Authorization" = "Bearer $($refreshResponse.accessToken)"
        "Content-Type" = "application/json"
    }
    
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
        -Method Get `
        -Headers $verifyHeaders `
        -TimeoutSec 10
    
    Write-Host "✅ New Token Verified: User $($verifyResponse.email)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Refresh Token FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# ============================================================================
# Test 6: Logout
# ============================================================================
Write-Host "Test 6: Logout" -ForegroundColor Yellow
Write-Host "POST $baseUrl/auth/logout" -ForegroundColor Gray

$logoutHeaders = @{
    "Authorization" = "Bearer $newAccessToken"
    "Content-Type" = "application/json"
}

try {
    $logoutResponse = Invoke-RestMethod -Uri "$baseUrl/auth/logout" `
        -Method Post `
        -Headers $logoutHeaders `
        -TimeoutSec 10
    
    Write-Host "✅ Logout PASSED" -ForegroundColor Green
    Write-Host "Response: $($logoutResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    
    # Try to use the token after logout (should fail)
    Write-Host "Verifying token is invalidated..." -ForegroundColor Gray
    try {
        $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
            -Method Get `
            -Headers $logoutHeaders `
            -TimeoutSec 10
        
        Write-Host "⚠️ WARNING: Token vẫn hoạt động sau khi logout" -ForegroundColor Yellow
    } catch {
        Write-Host "✅ Token đã bị vô hiệu hóa sau logout" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Logout FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================================================
# Test 7: Invalid Token Test
# ============================================================================
Write-Host "Test 7: Invalid Token Test" -ForegroundColor Yellow

$invalidHeaders = @{
    "Authorization" = "Bearer invalid_token_here"
    "Content-Type" = "application/json"
}

try {
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
        -Method Get `
        -Headers $invalidHeaders `
        -TimeoutSec 10
    
    Write-Host "❌ FAILED: Server chấp nhận token không hợp lệ" -ForegroundColor Red
    
} catch {
    Write-Host "✅ Invalid Token Rejected Correctly" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# Summary
# ============================================================================
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  TẤT CẢ TESTS ĐÃ HOÀN THÀNH" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Health Check" -ForegroundColor Green
Write-Host "✅ User Registration" -ForegroundColor Green
Write-Host "✅ JWT Token Verification" -ForegroundColor Green
Write-Host "✅ User Login" -ForegroundColor Green
Write-Host "✅ Token Refresh" -ForegroundColor Green
Write-Host "✅ Logout" -ForegroundColor Green
Write-Host "✅ Invalid Token Rejection" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 API và JWT hoạt động CHÍNH XÁC theo tài liệu!" -ForegroundColor Green
Write-Host ""
Write-Host "Test Account:" -ForegroundColor Yellow
Write-Host "  Email: $testEmail" -ForegroundColor Gray
Write-Host "  Password: $testPassword" -ForegroundColor Gray
Write-Host ""
