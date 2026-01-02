# Seed 5 Real Construction Projects
# Tao 5 du an xay dung thuc te

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

Write-Host "=== SEEDING CONSTRUCTION PROJECTS ===" -ForegroundColor Green

# Login
$loginBody = @{email=$ADMIN_EMAIL;password=$ADMIN_PASSWORD} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
$TOKEN = $loginResponse.accessToken
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "[OK] Logged in`n" -ForegroundColor Green

# 5 Construction Projects (using CLIENT IDs: 44-48)
$projects = @(
    @{
        title = "Biet thu 2 tang tai Thu Duc"
        description = "Xay dung biet thu hien dai 2 tang, dien tich 200m2, phong cach chau Au, dia chi: KDC Van Phuc City, TP Thu Duc. Chu dau tu: Nguyen Van Minh (0909123456)"
        status = "IN_PROGRESS"
        startDate = "2025-01-15"
        endDate = "2025-06-30"
        budget = 2800000000
        clientId = 44
    },
    @{
        title = "Nha pho 3 tang Binh Thanh"
        description = "Nha pho 3 tang mat tien duong, dien tich 80m2, phong cach hien dai, dia chi: 234 Xo Viet Nghe Tinh, Binh Thanh. Chu dau tu: Tran Thi Lan (0918234567)"
        status = "IN_PROGRESS"
        startDate = "2025-02-01"
        endDate = "2025-07-15"
        budget = 1850000000
        clientId = 45
    },
    @{
        title = "Chung cu mini 7 tang Go Vap"
        description = "Toa nha chung cu mini 7 tang, 28 can ho, dien tich dat 300m2, dia chi: Duong Quang Trung, Go Vap. Chu dau tu: Le Van Tuan (0907345678)"
        status = "PLANNING"
        startDate = "2025-03-15"
        endDate = "2025-12-31"
        budget = 5200000000
        clientId = 46
    },
    @{
        title = "Sua chua va nang cap nha cu Quan 1"
        description = "Sua chua ket cau, thay mai, nang cap he thong dien nuoc cho nha 3 tang, dia chi: 45 Nguyen Thai Binh, Quan 1. Chu dau tu: Pham Thi Hong (0912456789)"
        status = "IN_PROGRESS"
        startDate = "2025-01-20"
        endDate = "2025-04-30"
        budget = 950000000
        clientId = 47
    },
    @{
        title = "Nha xuong san xuat Binh Duong"
        description = "Nha xuong ket cau thep 1 tang, dien tich 1500m2, chieu cao 8m, dia chi: KCN VSIP II, Thu Dau Mot, Binh Duong. Chu dau tu: Hoang Van Duc (0903567890)"
        status = "PLANNING"
        startDate = "2025-04-01"
        endDate = "2025-09-30"
        budget = 3800000000
        clientId = 48
    }
)

Write-Host "Creating $($projects.Count) projects...`n" -ForegroundColor Cyan

$created = @()
$success = 0

foreach ($proj in $projects) {
    $projectJson = $proj | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/projects" -Method POST -Headers $headers -Body $projectJson
        Write-Host "  [OK] Created: $($proj.name) [ID: $($response.id)]" -ForegroundColor Green
        $created += $response
        $success++
    } catch {
        Write-Host "  [FAIL] $($proj.name)" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 300
}

Write-Host "`n=== PROJECT SEEDING COMPLETE ===" -ForegroundColor Green
Write-Host "Created: $success projects" -ForegroundColor White
Write-Host "Total projects in DB: ~$($success + 2) (including 2 existing)" -ForegroundColor Cyan

# Save project IDs for next scripts
if ($created.Count -gt 0) {
    $projectIds = $created | ForEach-Object { $_.id }
    Write-Host "`nProject IDs: $($projectIds -join ', ')" -ForegroundColor Yellow
    
    # Export to file for use in other scripts
    $projectIds | ConvertTo-Json | Out-File "scripts\_project_ids.json" -Encoding UTF8
    Write-Host "Saved project IDs to scripts\_project_ids.json" -ForegroundColor Cyan
}
