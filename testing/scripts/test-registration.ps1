# Test Registration API với 8 roles
# Usage: .\test-registration.ps1

$baseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "=== Testing Registration API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: CLIENT role
Write-Host "1. Testing CLIENT role..." -ForegroundColor Yellow
$body1 = @{
    email = "client-$(Get-Date -Format 'HHmmss')@example.com"
    password = "Test123456"
    name = "Test Client User"
    role = "CLIENT"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $body1
    Write-Host "✓ CLIENT registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($response1.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($response1.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($response1.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "✗ CLIENT registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: ENGINEER role
Write-Host "2. Testing ENGINEER role..." -ForegroundColor Yellow
$body2 = @{
    email = "engineer-$(Get-Date -Format 'HHmmss')@example.com"
    password = "Test123456"
    name = "Test Engineer User"
    role = "ENGINEER"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $body2
    Write-Host "✓ ENGINEER registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($response2.user.id)" -ForegroundColor Gray
    Write-Host "  Role: $($response2.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "✗ ENGINEER registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: CONTRACTOR role
Write-Host "3. Testing CONTRACTOR role..." -ForegroundColor Yellow
$body3 = @{
    email = "contractor-$(Get-Date -Format 'HHmmss')@example.com"
    password = "Test123456"
    name = "Test Contractor User"
    role = "CONTRACTOR"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $body3
    Write-Host "✓ CONTRACTOR registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($response3.user.id)" -ForegroundColor Gray
    Write-Host "  Role: $($response3.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "✗ CONTRACTOR registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: STAFF role (no secret from backend, frontend validates)
Write-Host "4. Testing STAFF role..." -ForegroundColor Yellow
$body4 = @{
    email = "staff-$(Get-Date -Format 'HHmmss')@example.com"
    password = "Test123456"
    name = "Test Staff User"
    role = "STAFF"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $body4
    Write-Host "✓ STAFF registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($response4.user.id)" -ForegroundColor Gray
    Write-Host "  Role: $($response4.user.role)" -ForegroundColor Gray
    Write-Host "  Note: Frontend should validate staff secret 'Nhaxinh@123'" -ForegroundColor Magenta
} catch {
    Write-Host "✗ STAFF registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: ARCHITECT role
Write-Host "5. Testing ARCHITECT role..." -ForegroundColor Yellow
$body5 = @{
    email = "architect-$(Get-Date -Format 'HHmmss')@example.com"
    password = "Test123456"
    name = "Test Architect User"
    role = "ARCHITECT"
} | ConvertTo-Json

try {
    $response5 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -ContentType "application/json" -Body $body5
    Write-Host "✓ ARCHITECT registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($response5.user.id)" -ForegroundColor Gray
    Write-Host "  Role: $($response5.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "✗ ARCHITECT registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Test completed! Check results above." -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify users in database with: SELECT id, email, role FROM users ORDER BY id DESC LIMIT 5;" -ForegroundColor Gray
Write-Host "2. Test staff secret key on mobile app registration screen" -ForegroundColor Gray
Write-Host "3. Test login with created users" -ForegroundColor Gray
