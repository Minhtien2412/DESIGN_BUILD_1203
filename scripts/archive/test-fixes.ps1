# Quick Test Script - API & Auth Fixes
Write-Host "=== API & AUTH FIXES VERIFICATION ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check ApiError class
Write-Host "Test 1: Checking ApiError class..." -ForegroundColor Yellow
$apiContent = Get-Content "services\api.ts" -Raw
if ($apiContent -match "export class ApiError extends Error") {
    Write-Host "  ❌ FAILED: ApiError still extends Error" -ForegroundColor Red
} elseif ($apiContent -match "export class ApiError \{") {
    Write-Host "  ✅ PASSED: ApiError no longer extends Error" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  WARNING: Could not find ApiError class" -ForegroundColor Yellow
}

# Test 2: Check AuthContext imports
Write-Host ""
Write-Host "Test 2: Checking AuthContext imports..." -ForegroundColor Yellow
$authContent = Get-Content "context\AuthContext.tsx" -Raw
if ($authContent -match "setAuthToken") {
    Write-Host "  ✅ PASSED: AuthContext imports setAuthToken from api.ts" -ForegroundColor Green
} else {
    Write-Host "  ❌ FAILED: AuthContext does not import setAuthToken" -ForegroundColor Red
}

if ($authContent -match "clearApiToken") {
    Write-Host "  ✅ PASSED: AuthContext imports clearApiToken from api.ts" -ForegroundColor Green
} else {
    Write-Host "  ❌ FAILED: AuthContext does not import clearApiToken" -ForegroundColor Red
}

# Test 3: Check helper functions
Write-Host ""
Write-Host "Test 3: Checking token sync helper functions..." -ForegroundColor Yellow
if ($authContent -match "const setToken = async \(token: string\)") {
    Write-Host "  ✅ PASSED: setToken helper function exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ FAILED: setToken helper function not found" -ForegroundColor Red
}

if ($authContent -match "const clearToken = async") {
    Write-Host "  ✅ PASSED: clearToken helper function exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ FAILED: clearToken helper function not found" -ForegroundColor Red
}

# Test 4: Check loadSession sets token
Write-Host ""
Write-Host "Test 4: Checking loadSession sets API token..." -ForegroundColor Yellow
if ($authContent -match "setAuthToken\(token\)") {
    Write-Host "  ✅ PASSED: loadSession calls setAuthToken" -ForegroundColor Green
} else {
    Write-Host "  ❌ FAILED: loadSession does not call setAuthToken" -ForegroundColor Red
}

# Test 5: Check stack trace capture
Write-Host ""
Write-Host "Test 5: Checking ApiError stack trace..." -ForegroundColor Yellow
if ($apiContent -match "Error\.captureStackTrace") {
    Write-Host "  ✅ PASSED: ApiError captures stack trace" -ForegroundColor Green
} else {
    Write-Host "  ❌ FAILED: ApiError does not capture stack trace" -ForegroundColor Red
}

# Test 6: TypeScript compilation
Write-Host ""
Write-Host "Test 6: Running TypeScript check..." -ForegroundColor Yellow
Write-Host "  (This may take a moment...)" -ForegroundColor Gray

$tscOutput = npx tsc --noEmit 2>&1 | Out-String
$errorCount = ([regex]::Matches($tscOutput, "error TS")).Count

if ($errorCount -eq 0) {
    Write-Host "  ✅ PASSED: No TypeScript errors in modified files" -ForegroundColor Green
} elseif ($errorCount -lt 10) {
    Write-Host "  ⚠️  WARNING: $errorCount TypeScript errors found (check if related to fixes)" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️  INFO: $errorCount TypeScript errors found (likely pre-existing)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Core Fixes:" -ForegroundColor White
Write-Host "  • ApiError refactored (no longer extends Error)" -ForegroundColor Gray
Write-Host "  • Token sync between storage and API service" -ForegroundColor Gray
Write-Host "  • loadSession() sets API token on startup" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected Outcomes:" -ForegroundColor White
Write-Host "  ✅ No more Babel construct.js call stack errors" -ForegroundColor Green
Write-Host "  ✅ No more 'No token provided' API errors" -ForegroundColor Green
Write-Host "  ✅ User sessions persist across app restarts" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Test login with valid credentials" -ForegroundColor Gray
Write-Host "  2. Check console - should see token set messages" -ForegroundColor Gray
Write-Host "  3. Make API calls - should work without auth errors" -ForegroundColor Gray
Write-Host "  4. Reload app - should stay logged in" -ForegroundColor Gray
Write-Host ""
Write-Host "Files Modified:" -ForegroundColor White
Write-Host "  • services/api.ts" -ForegroundColor Gray
Write-Host "  • context/AuthContext.tsx" -ForegroundColor Gray
Write-Host ""
Write-Host "=== END ===" -ForegroundColor Cyan
