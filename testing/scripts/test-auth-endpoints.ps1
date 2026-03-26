# ============================================================================
# AUTHENTICATION ENDPOINTS TEST
# Kiểm tra các endpoint đăng ký/đăng nhập theo tài liệu AUTH_API_DOCS.md
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔐 AUTHENTICATION ENDPOINTS TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration từ tài liệu
$BaseUrl = "https://baotienweb.cloud/api/v1"
$ApiKey = "dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88"

# Test data
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "testuser${timestamp}@test.com"
$testPassword = "TestPassword123!"
$testName = "Test User $timestamp"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "  API Key: $($ApiKey.Substring(0,15))..." -ForegroundColor Gray
Write-Host "  Test Email: $testEmail" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# TEST 1: Health Check
# ============================================================================
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "TEST 1: Health Check Endpoint" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

try {
    $healthUrl = "$BaseUrl".Replace("/api/v1", "/health")
    Write-Host "🔍 Testing: GET $healthUrl" -ForegroundColor Gray
    
    $healthResponse = Invoke-WebRequest -Uri $healthUrl -Method GET -UseBasicParsing -TimeoutSec 10
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Health Check: PASSED" -ForegroundColor Green
        Write-Host "   Status Code: $($healthResponse.StatusCode)" -ForegroundColor Gray
        Write-Host "   Response: $($healthResponse.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================================================
# TEST 2: Register New User (POST /auth/register)
# ============================================================================
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "TEST 2: Register New User" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

$registerBody = @{
    email = $testEmail
    password = $testPassword
    name = $testName
} | ConvertTo-Json

$registerHeaders = @{
    "Content-Type" = "application/json"
    "x-api-key" = $ApiKey
}

try {
    Write-Host "🔍 Testing: POST $BaseUrl/auth/register" -ForegroundColor Gray
    
    $registerResponse = Invoke-WebRequest `
        -Uri "$BaseUrl/auth/register" `
        -Method POST `
        -Headers $registerHeaders `
        -Body $registerBody `
        -UseBasicParsing `
        -TimeoutSec 15
    
    $registerData = $registerResponse.Content | ConvertFrom-Json
    
    if ($registerResponse.StatusCode -eq 201 -and $registerData.accessToken) {
        Write-Host "✅ Register: PASSED" -ForegroundColor Green
        Write-Host "   Status Code: $($registerResponse.StatusCode)" -ForegroundColor Gray
        Write-Host "   User ID: $($registerData.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($registerData.user.email)" -ForegroundColor Gray
        Write-Host "   Role: $($registerData.user.role)" -ForegroundColor Gray
        Write-Host "   Access Token: $($registerData.accessToken.Substring(0,30))..." -ForegroundColor Gray
        
        $Global:accessToken = $registerData.accessToken
        $Global:refreshToken = $registerData.refreshToken
        $Global:userId = $registerData.user.id
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 409) {
        Write-Host "⚠️ Register: User already exists (409)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Register: FAILED (Status: $statusCode)" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# ============================================================================
# TEST 3: Login (POST /auth/login)
# ============================================================================
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "TEST 3: Login with Credentials" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

$loginHeaders = @{
    "Content-Type" = "application/json"
    "x-api-key" = $ApiKey
}

try {
    Write-Host "🔍 Testing: POST $BaseUrl/auth/login" -ForegroundColor Gray
    
    $loginResponse = Invoke-WebRequest `
        -Uri "$BaseUrl/auth/login" `
        -Method POST `
        -Headers $loginHeaders `
        -Body $loginBody `
        -UseBasicParsing `
        -TimeoutSec 15
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginResponse.StatusCode -eq 200 -and $loginData.accessToken) {
        Write-Host "✅ Login: PASSED" -ForegroundColor Green
        Write-Host "   Status Code: $($loginResponse.StatusCode)" -ForegroundColor Gray
        Write-Host "   User ID: $($loginData.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($loginData.user.email)" -ForegroundColor Gray
        Write-Host "   Role: $($loginData.user.role)" -ForegroundColor Gray
        Write-Host "   Access Token: $($loginData.accessToken.Substring(0,30))..." -ForegroundColor Gray
        
        $Global:accessToken = $loginData.accessToken
        $Global:refreshToken = $loginData.refreshToken
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 401) {
        Write-Host "❌ Login: Unauthorized (401)" -ForegroundColor Red
    } else {
        Write-Host "❌ Login: FAILED (Status: $statusCode)" -ForegroundColor Red
    }
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================================================
# TEST 4: Protected Endpoint - Get Projects
# ============================================================================
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "TEST 4: Protected Endpoint - Projects" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

if ($Global:accessToken) {
    $protectedHeaders = @{
        "Authorization" = "Bearer $($Global:accessToken)"
        "x-api-key" = $ApiKey
    }
    
    try {
        Write-Host "🔍 Testing: GET $BaseUrl/projects" -ForegroundColor Gray
        
        $projectsResponse = Invoke-WebRequest `
            -Uri "$BaseUrl/projects" `
            -Method GET `
            -Headers $protectedHeaders `
            -UseBasicParsing `
            -TimeoutSec 15
        
        if ($projectsResponse.StatusCode -eq 200) {
            $projectsData = $projectsResponse.Content | ConvertFrom-Json
            Write-Host "✅ Protected Endpoint: PASSED" -ForegroundColor Green
            Write-Host "   Status Code: $($projectsResponse.StatusCode)" -ForegroundColor Gray
            Write-Host "   Projects Count: $($projectsData.Count)" -ForegroundColor Gray
            
            if ($projectsData.Count -gt 0) {
                Write-Host "   First Project: $($projectsData[0].name)" -ForegroundColor Gray
            }
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401) {
            Write-Host "❌ Protected Endpoint: Unauthorized (401)" -ForegroundColor Red
        } else {
            Write-Host "❌ Protected Endpoint: FAILED (Status: $statusCode)" -ForegroundColor Red
        }
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipping (no access token)" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# TEST 5: Token Refresh
# ============================================================================
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "TEST 5: Token Refresh" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

if ($Global:refreshToken) {
    $refreshHeaders = @{
        "Authorization" = "Bearer $($Global:refreshToken)"
        "x-api-key" = $ApiKey
    }
    
    try {
        Write-Host "🔍 Testing: POST $BaseUrl/auth/refresh" -ForegroundColor Gray
        
        $refreshResponse = Invoke-WebRequest `
            -Uri "$BaseUrl/auth/refresh" `
            -Method POST `
            -Headers $refreshHeaders `
            -UseBasicParsing `
            -TimeoutSec 15
        
        if ($refreshResponse.StatusCode -eq 200) {
            $refreshData = $refreshResponse.Content | ConvertFrom-Json
            Write-Host "✅ Token Refresh: PASSED" -ForegroundColor Green
            Write-Host "   Status Code: $($refreshResponse.StatusCode)" -ForegroundColor Gray
            Write-Host "   New Access Token: $($refreshData.accessToken.Substring(0,30))..." -ForegroundColor Gray
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401) {
            Write-Host "❌ Token Refresh: Unauthorized (401)" -ForegroundColor Red
        } else {
            Write-Host "❌ Token Refresh: FAILED (Status: $statusCode)" -ForegroundColor Red
        }
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipping (no refresh token)" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoint Configuration:" -ForegroundColor Yellow
Write-Host "  Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "  Register: POST $BaseUrl/auth/register" -ForegroundColor Gray
Write-Host "  Login: POST $BaseUrl/auth/login" -ForegroundColor Gray
Write-Host "  Refresh: POST $BaseUrl/auth/refresh" -ForegroundColor Gray
Write-Host "  Protected: GET $BaseUrl/projects" -ForegroundColor Gray
Write-Host ""
Write-Host "Required Headers:" -ForegroundColor Yellow
Write-Host "  Content-Type: application/json" -ForegroundColor Gray
Write-Host "  x-api-key: $ApiKey" -ForegroundColor Gray
Write-Host "  Authorization: Bearer <token> (protected endpoints)" -ForegroundColor Gray
Write-Host ""
Write-Host "Token Information:" -ForegroundColor Yellow
Write-Host "  Access Token: 15 minutes (900s)" -ForegroundColor Gray
Write-Host "  Refresh Token: 7 days (604800s)" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation: docs/AUTH_API_DOCS.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
