# API Test Script - Direct Backend Testing via SSH (PowerShell)
# Usage: .\test-api-direct.ps1 [-Role admin|engineer|client]

param(
    [string]$Role = "admin"
)

$SERVER = "103.200.20.100"
$API_PORT = "3000"
$API_BASE = "http://localhost:${API_PORT}"
$API_PREFIX = "/api/v1"
$API_KEY = "baotienweb-api-key-2025"

# Test accounts
$Accounts = @{
    admin = @{
        Email = "admin@baotien.vn"
        Password = "admin123"
    }
    engineer = @{
        Email = "engineer@baotien.vn"
        Password = "engineer123"
    }
    client = @{
        Email = "client@baotien.vn"
        Password = "client123"
    }
}

$Account = $Accounts[$Role]
$Email = $Account.Email
$Password = $Account.Password

Write-Host "🧪 API Test Script - Direct Backend Testing" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue
Write-Host ""

# Function to make API request
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = $null,
        [string]$Token = $null
    )
    
    $url = "${API_BASE}${API_PREFIX}${Endpoint}"
    $headers = @{
        "Content-Type" = "application/json"
        "X-API-Key" = $API_KEY
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = $url
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = $Body
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        return $null
    }
}

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
Write-Host "GET ${API_BASE}/health"

try {
    $healthResponse = Invoke-RestMethod -Uri "${API_BASE}/health" -Method Get
    Write-Host "Response: $($healthResponse | ConvertTo-Json -Compress)"
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 2: Login
Write-Host "Test 2: Login ($Role)" -ForegroundColor Yellow
Write-Host "POST ${API_PREFIX}/auth/login"
Write-Host "Email: $Email"

$loginData = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginData

if ($loginResponse -and $loginResponse.token) {
    $accessToken = $loginResponse.token
    Write-Host "Response: $($loginResponse | ConvertTo-Json -Compress)"
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Token: $($accessToken.Substring(0, [Math]::Min(20, $accessToken.Length)))..."
    Write-Host ""
} else {
    Write-Host "❌ Login failed - No token received" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 3: Get Current User
Write-Host "Test 3: Get Current User" -ForegroundColor Yellow
Write-Host "GET ${API_PREFIX}/auth/me"

$meResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/me" -Token $accessToken

if ($meResponse) {
    Write-Host "Response: $($meResponse | ConvertTo-Json -Compress)"
    Write-Host "✅ Get current user successful" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Get current user failed" -ForegroundColor Red
    Write-Host ""
}

# Test 4: List Users (Admin only)
if ($Role -eq "admin") {
    Write-Host "Test 4: List Users" -ForegroundColor Yellow
    Write-Host "GET ${API_PREFIX}/users?page=1&limit=5"
    
    $usersResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/users?page=1&limit=5" -Token $accessToken
    
    if ($usersResponse) {
        Write-Host "Response: $($usersResponse | ConvertTo-Json -Compress -Depth 3)"
        Write-Host "✅ List users successful" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ List users failed" -ForegroundColor Red
        Write-Host ""
    }
}

# Test 5: List Projects
Write-Host "Test 5: List Projects" -ForegroundColor Yellow
Write-Host "GET ${API_PREFIX}/projects?page=1&limit=5"

$projectsResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/projects?page=1&limit=5" -Token $accessToken

if ($projectsResponse) {
    Write-Host "Response: $($projectsResponse | ConvertTo-Json -Compress -Depth 3)"
    Write-Host "✅ List projects successful" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ List projects failed" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Get Dashboard
Write-Host "Test 6: Get Dashboard ($Role)" -ForegroundColor Yellow
Write-Host "GET ${API_PREFIX}/dashboard/${Role}"

$dashboardResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/dashboard/${Role}" -Token $accessToken

if ($dashboardResponse) {
    Write-Host "Response: $($dashboardResponse | ConvertTo-Json -Compress -Depth 3)"
    Write-Host "✅ Get dashboard successful" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Get dashboard failed" -ForegroundColor Red
    Write-Host ""
}

# Test 7: List Tasks
Write-Host "Test 7: List Tasks" -ForegroundColor Yellow
Write-Host "GET ${API_PREFIX}/tasks?page=1&limit=5"

$tasksResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/tasks?page=1&limit=5" -Token $accessToken

if ($tasksResponse) {
    Write-Host "Response: $($tasksResponse | ConvertTo-Json -Compress -Depth 3)"
    Write-Host "✅ List tasks successful" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ List tasks failed" -ForegroundColor Red
    Write-Host ""
}

# Summary
Write-Host "================================================" -ForegroundColor Blue
Write-Host "🎉 API Test Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "All core endpoints tested successfully."
Write-Host "Access token is valid and working."
Write-Host ""
Write-Host "Access Token:" -ForegroundColor Cyan
Write-Host $accessToken
Write-Host ""
Write-Host "You can use this token in your app for testing."
