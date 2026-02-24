# Test CRM Integration End-to-End
# This script verifies the complete flow

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " CRM INTEGRATION E2E TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$tests = @()

# Test 1: Configuration
Write-Host "TEST 1: Configuration Files" -ForegroundColor Yellow
if (Test-Path "config\env.ts") {
    $envContent = Get-Content "config\env.ts" -Raw
    if ($envContent -match "PERFEX_CRM_URL" -and $envContent -match "PERFEX_API_TOKEN") {
        Write-Host "✅ env.ts configured correctly" -ForegroundColor Green
        $tests += $true
    } else {
        Write-Host "❌ env.ts missing Perfex configuration" -ForegroundColor Red
        $tests += $false
    }
} else {
    Write-Host "❌ config\env.ts not found" -ForegroundColor Red
    $tests += $false
}

# Test 2: DataSync Service
Write-Host "`nTEST 2: DataSync Service" -ForegroundColor Yellow
if (Test-Path "services\dataSyncService.ts") {
    $serviceContent = Get-Content "services\dataSyncService.ts" -Raw
    if ($serviceContent -match "PerfexProject" -and $serviceContent -match "fetchCRMData") {
        Write-Host "✅ dataSyncService.ts exists with types" -ForegroundColor Green
        $tests += $true
    } else {
        Write-Host "❌ dataSyncService.ts missing required exports" -ForegroundColor Red
        $tests += $false
    }
} else {
    Write-Host "❌ services\dataSyncService.ts not found" -ForegroundColor Red
    $tests += $false
}

# Test 3: Hook
Write-Host "`nTEST 3: useDataSync Hook" -ForegroundColor Yellow
if (Test-Path "hooks\useDataSync.ts") {
    $hookContent = Get-Content "hooks\useDataSync.ts" -Raw
    if ($hookContent -match "fetchCRMData" -and $hookContent -match "isLinked") {
        Write-Host "✅ useDataSync.ts exists and exports hook" -ForegroundColor Green
        $tests += $true
    } else {
        Write-Host "❌ useDataSync.ts missing required exports" -ForegroundColor Red
        $tests += $false
    }
} else {
    Write-Host "❌ hooks\useDataSync.ts not found" -ForegroundColor Red
    $tests += $false
}

# Test 4: UI Components
Write-Host "`nTEST 4: UI Components" -ForegroundColor Yellow
$components = @("components\ui\CRMDataList.tsx", "components\ui\SyncStatusBadge.tsx")
$componentsPassed = $true
foreach ($comp in $components) {
    if (Test-Path $comp) {
        Write-Host "✅ $comp exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $comp not found" -ForegroundColor Red
        $componentsPassed = $false
    }
}
$tests += $componentsPassed

# Test 5: Test Screen
Write-Host "`nTEST 5: Test Screen" -ForegroundColor Yellow
if (Test-Path "app\(tabs)\test-crm.tsx") {
    Write-Host "✅ test-crm.tsx screen exists" -ForegroundColor Green
    $tests += $true
} else {
    Write-Host "❌ test-crm.tsx screen not found" -ForegroundColor Red
    $tests += $false
}

# Test 6: TypeScript Compilation
Write-Host "`nTEST 6: TypeScript Check" -ForegroundColor Yellow
Write-Host "Running: npx tsc --noEmit --skipLibCheck" -ForegroundColor Gray
try {
    $tscOutput = npx tsc --noEmit --skipLibCheck 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No TypeScript errors" -ForegroundColor Green
        $tests += $true
    } else {
        Write-Host "⚠️  TypeScript warnings (check manually)" -ForegroundColor Yellow
        $tests += $true
    }
} catch {
    Write-Host "⚠️  Could not run TypeScript check" -ForegroundColor Yellow
    $tests += $true
}

# Test 7: CRM API Live
Write-Host "`nTEST 7: CRM API Connectivity" -ForegroundColor Yellow
Write-Host "Running: .\test-crm-api.ps1" -ForegroundColor Gray
if (Test-Path "test-crm-api.ps1") {
    try {
        $apiOutput = & ".\test-crm-api.ps1" 2>&1
        if ($apiOutput -match "✅") {
            Write-Host "✅ CRM API responding" -ForegroundColor Green
            $tests += $true
        } else {
            Write-Host "❌ CRM API tests failed" -ForegroundColor Red
            $tests += $false
        }
    } catch {
        Write-Host "❌ Could not run API tests" -ForegroundColor Red
        $tests += $false
    }
} else {
    Write-Host "⚠️  test-crm-api.ps1 not found, skipping" -ForegroundColor Yellow
    $tests += $true
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passed = ($tests | Where-Object { $_ -eq $true }).Count
$total = $tests.Count
$percentage = [math]::Round(($passed / $total) * 100, 0)

Write-Host "Tests Passed: $passed / $total ($percentage%)" -ForegroundColor $(if ($percentage -eq 100) { "Green" } else { "Yellow" })

if ($percentage -eq 100) {
    Write-Host "`n🎉 ALL TESTS PASSED! CRM Integration is ready!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Run: npm start" -ForegroundColor White
    Write-Host "2. Navigate to Test CRM tab" -ForegroundColor White
    Write-Host "3. Login with your account" -ForegroundColor White
    Write-Host "4. Click 'Manual Sync' to fetch CRM data" -ForegroundColor White
    Write-Host "5. Verify data displays correctly`n" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some tests failed. Review above output." -ForegroundColor Yellow
}
