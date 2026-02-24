# Perfex CRM API Test Script
# Test all endpoints for data sync integration

$PERFEX_URL = "https://thietkeresort.com.vn/perfex_crm"
$API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibmhheGluaGQiLCJuYW1lIjoidGhpZXRrZXJlc29ydCIsIkFQSV9USU1FIjoxNzY3MDYzNzE1fQ.L9Mcg_xEOdcEYXbz9BprB93RD7ZuonhsshYPPInQm4Q"

$headers = @{
    "Authorization" = "Bearer $API_TOKEN"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " PERFEX CRM API TESTS" -ForegroundColor Cyan  
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Customers
Write-Host "TEST 1: Customers" -ForegroundColor Yellow
try {
    $customers = Invoke-RestMethod -Uri "$PERFEX_URL/api/customers" -Headers $headers -Method GET
    Write-Host "✅ SUCCESS - Found $($customers.Count) customers" -ForegroundColor Green
    if ($customers.Count -gt 0) {
        Write-Host "First customer: $($customers[0].company)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Projects
Write-Host "`nTEST 2: Projects" -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "$PERFEX_URL/api/projects" -Headers $headers -Method GET
    Write-Host "✅ SUCCESS - Found $($projects.Count) projects" -ForegroundColor Green
    if ($projects.Count -gt 0) {
        Write-Host "First project: $($projects[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Invoices
Write-Host "`nTEST 3: Invoices" -ForegroundColor Yellow
try {
    $invoices = Invoke-RestMethod -Uri "$PERFEX_URL/api/invoices" -Headers $headers -Method GET
    Write-Host "✅ SUCCESS - Found $($invoices.Count) invoices" -ForegroundColor Green
    if ($invoices.Count -gt 0) {
        Write-Host "First invoice: #$($invoices[0].number) - $($invoices[0].total) VND" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Estimates
Write-Host "`nTEST 4: Estimates" -ForegroundColor Yellow
try {
    $estimates = Invoke-RestMethod -Uri "$PERFEX_URL/api/estimates" -Headers $headers -Method GET
    Write-Host "✅ SUCCESS - Found $($estimates.Count) estimates" -ForegroundColor Green
    if ($estimates.Count -gt 0) {
        Write-Host "First estimate: #$($estimates[0].number) - $($estimates[0].total) VND" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Tickets
Write-Host "`nTEST 5: Tickets" -ForegroundColor Yellow
try {
    $tickets = Invoke-RestMethod -Uri "$PERFEX_URL/api/tickets" -Headers $headers -Method GET
    Write-Host "✅ SUCCESS - Found $($tickets.Count) tickets" -ForegroundColor Green
    if ($tickets.Count -gt 0) {
        Write-Host "First ticket: $($tickets[0].subject)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Tasks
Write-Host "`nTEST 6: Tasks" -ForegroundColor Yellow
try {
    $tasks = Invoke-RestMethod -Uri "$PERFEX_URL/api/tasks" -Headers $headers -Method GET
    Write-Host "✅ SUCCESS - Found $($tasks.Count) tasks" -ForegroundColor Green
    if ($tasks.Count -gt 0) {
        Write-Host "First task: $($tasks[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Staff
Write-Host "`nTEST 7: Staff" -ForegroundColor Yellow
try {
    $staff = Invoke-RestMethod -Uri "$PERFEX_URL/api/staff" -Headers $headers -Method GET
    Write-Host "✅ SUCCESS - Found $($staff.Count) staff members" -ForegroundColor Green
    if ($staff.Count -gt 0) {
        Write-Host "First staff: $($staff[0].firstname) $($staff[0].lastname)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " TESTS COMPLETED" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
