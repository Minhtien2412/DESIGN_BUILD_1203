# Check Existing Data in Backend
# Kiem tra du lieu hien tai trong database

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

Write-Host "=== CHECKING EXISTING DATA ===" -ForegroundColor Cyan

# Login
Write-Host "`n[1/8] Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{email=$ADMIN_EMAIL;password=$ADMIN_PASSWORD} | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -ErrorAction Stop
    $TOKEN = $loginResponse.accessToken
    Write-Host "[OK] Logged in as $ADMIN_EMAIL`n" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Cannot login: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# Check Products
Write-Host "[2/8] Checking Products..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$API_BASE/products" -Headers $headers
    if ($products -is [Array]) {
        $productCount = $products.Count
    } else {
        $productCount = $products.data.Count
    }
    Write-Host "  [OK] Products: $productCount" -ForegroundColor Green
    
    # Group by category
    $byCategory = $products | Group-Object category
    foreach ($group in $byCategory) {
        Write-Host "    - $($group.Name): $($group.Count) products" -ForegroundColor White
    }
} catch {
    Write-Host "  [FAIL] Cannot fetch products: $_" -ForegroundColor Red
}

# Check Projects
Write-Host "`n[3/8] Checking Projects..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "$API_BASE/projects" -Headers $headers
    if ($projects -is [Array]) {
        $projectCount = $projects.Count
    } else {
        $projectCount = $projects.data.Count
    }
    Write-Host "  [OK] Projects: $projectCount" -ForegroundColor Green
    
    if ($projectCount -gt 0) {
        $statusGroups = $projects | Group-Object status
        foreach ($group in $statusGroups) {
            Write-Host "    - $($group.Name): $($group.Count) projects" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  [WARN] Projects endpoint: $_" -ForegroundColor Yellow
    Write-Host "  [INFO] Projects table may be empty or endpoint different" -ForegroundColor Cyan
}

# Check Users
Write-Host "`n[4/8] Checking Users..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "$API_BASE/users" -Headers $headers
    if ($users -is [Array]) {
        $userCount = $users.Count
    } else {
        $userCount = $users.data.Count
    }
    Write-Host "  [OK] Users: $userCount" -ForegroundColor Green
    
    if ($userCount -gt 0) {
        $roleGroups = $users | Group-Object role
        foreach ($group in $roleGroups) {
            Write-Host "    - $($group.Name): $($group.Count) users" -ForegroundColor White
        }
    }
} catch {
    Write-Host "  [WARN] Users endpoint: $_" -ForegroundColor Yellow
}

# Check Budget
Write-Host "`n[5/8] Checking Budget..." -ForegroundColor Yellow
try {
    $budget = Invoke-RestMethod -Uri "$API_BASE/budget" -Headers $headers
    Write-Host "  [OK] Budget data exists" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] No budget data or endpoint different" -ForegroundColor Yellow
}

# Check Inventory
Write-Host "`n[6/8] Checking Inventory..." -ForegroundColor Yellow
try {
    $inventory = Invoke-RestMethod -Uri "$API_BASE/inventory/materials" -Headers $headers
    if ($inventory -is [Array]) {
        $invCount = $inventory.Count
    } else {
        $invCount = $inventory.data.Count
    }
    Write-Host "  [OK] Materials in inventory: $invCount" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] No inventory data or endpoint different" -ForegroundColor Yellow
}

# Check Daily Reports
Write-Host "`n[7/8] Checking Daily Reports..." -ForegroundColor Yellow
try {
    $reports = Invoke-RestMethod -Uri "$API_BASE/daily-reports" -Headers $headers
    if ($reports -is [Array]) {
        $reportCount = $reports.Count
    } else {
        $reportCount = $reports.data.Count
    }
    Write-Host "  [OK] Daily reports: $reportCount" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] No daily reports or endpoint different" -ForegroundColor Yellow
}

# Check Inspections
Write-Host "`n[8/8] Checking QC Inspections..." -ForegroundColor Yellow
try {
    $inspections = Invoke-RestMethod -Uri "$API_BASE/qc/inspections" -Headers $headers
    if ($inspections -is [Array]) {
        $inspCount = $inspections.Count
    } else {
        $inspCount = $inspections.data.Count
    }
    Write-Host "  [OK] Inspections: $inspCount" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] No inspections or endpoint different" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Data populated:" -ForegroundColor White
Write-Host "  [OK] Products: $productCount (Ready for shopping)" -ForegroundColor Green
Write-Host "  [PENDING] Projects: Needs seeding" -ForegroundColor Yellow
Write-Host "  [PENDING] Users: Needs more test users" -ForegroundColor Yellow
Write-Host "  [PENDING] Timeline: Needs seeding" -ForegroundColor Yellow
Write-Host "  [PENDING] Budget: Needs seeding" -ForegroundColor Yellow
Write-Host "  [PENDING] Inventory: Needs seeding" -ForegroundColor Yellow
Write-Host "  [PENDING] Daily Reports: Needs seeding" -ForegroundColor Yellow
Write-Host "  [PENDING] QC/QA: Needs seeding" -ForegroundColor Yellow

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Create seed-projects.ps1 - Add 5-10 sample projects" -ForegroundColor White
Write-Host "2. Create seed-users.ps1 - Add 15 test users" -ForegroundColor White
Write-Host "3. Create seed-timeline.ps1 - Add phases for projects" -ForegroundColor White
Write-Host "4. Refer to DATA_SEEDING_PLAN.md for full roadmap" -ForegroundColor White
