# Seed Daily Progress Reports
$API_BASE = "https://baotienweb.cloud/api/v1"
$EMAIL = "admin2@test.com"
$PASSWORD = "123456"

Write-Host "=== SEEDING DAILY PROGRESS REPORTS ===" -ForegroundColor Cyan

# Login
try {
    $loginBody = @{
        email = $EMAIL
        password = $PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-Host "[OK] Logged in" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Login failed: $_" -ForegroundColor Red
    exit 1
}

# Read project IDs
$projectIdsPath = "scripts\_project_ids.json"
if (Test-Path $projectIdsPath) {
    $projectIds = Get-Content $projectIdsPath | ConvertFrom-Json
    Write-Host "Loaded $($projectIds.Count) project IDs from file" -ForegroundColor Gray
} else {
    $projectIds = @(4, 5, 6, 7, 8)
    Write-Host "Using hardcoded project IDs: $($projectIds -join ', ')" -ForegroundColor Gray
}

Write-Host "`nCreating daily reports for IN_PROGRESS projects..." -ForegroundColor Yellow

# Weather conditions (realistic for Saigon)
$weatherOptions = @(
    "Nang nhe, 28-32°C, kho rao thich hop"
    "May co mua nho chieu, 26-30°C"
    "Nang nhieu, 30-35°C, can chu y phong chong nang nong"
    "Mua to sang, da tam ngung, chieu tiep tuc"
    "Thoi tiet dep, may tho 26-29°C, dieu kien thi cong tot"
)

# Activity templates
$activities = @(
    "Dao dat, dam coc khu vuc A"
    "Do be tong long mong, tien do 80%"
    "Lap dat cot thep tang 1, hoan thanh 12/20 cot"
    "Thi cong san tang 1, dang don op pha"
    "Xay tuong tang 1, hoan thanh 60%"
    "Do be tong cot, dam tang 2"
    "Lap dat he thong dien nuoc tang tret"
    "Op lat gach nha ve sinh, tien do 40%"
    "Thi cong son tuong ngoai, hoan thanh mat tien"
    "Lap cua chinh va cua so, hoan thanh 70%"
)

# Material usage
$materials = @(
    "Xi mang: 80 bao, Cat: 12m3, Da: 15m3"
    "Thep D16: 2.5 tan, Thep D10: 1.8 tan"
    "Be tong ready-mix M300: 25m3"
    "Gach block: 2000 vien, Xi mang xay: 40 bao"
    "Son ngoai that: 120 lit, Son lot: 80 lit"
    "Cua go cong nghiep: 8 canh, Khoa tay nam: 8 bo"
    "Gach lat 60x60: 180m2, Keo dan gach: 25 bao"
    "Ong nuoc Binh Minh D90: 50 ong, Ong day dien Cadivi: 200m"
)

# Issues (some reports have issues)
$issues = @(
    "Thieu 200 vien gach block, da lien he nha cung cap giao them"
    "Mua to lam gian doan thi cong sang, mat 4 gio lao dong"
    "Phat hien vet nut nho tren be tong cot C3, da bao ky su kiem tra"
    "Thieu 2 tho han, anh huong tien do 15%"
    "Chat luong cat khong dat, da doi lot moi"
    ""
    ""
    ""
)

$createdCount = 0
$createdReportIds = @()

# Only seed for IN_PROGRESS projects (IDs 4, 5, 7 based on seed-projects.ps1)
$activeProjects = @(4, 5, 7)

foreach ($projectId in $activeProjects) {
    Write-Host "`n[Project $projectId] Creating reports..." -ForegroundColor Cyan
    
    # Create 20-25 daily reports (last 20-25 days)
    $reportCount = Get-Random -Minimum 20 -Maximum 26
    $currentDate = Get-Date
    
    for ($i = $reportCount; $i -gt 0; $i--) {
        $reportDate = $currentDate.AddDays(-$i).ToString("yyyy-MM-dd")
        $workerCount = Get-Random -Minimum 15 -Maximum 35
        
        $reportData = @{
            projectId = $projectId
            date = $reportDate
            weather = $weatherOptions | Get-Random
            workersCount = $workerCount
            workCompleted = $activities | Get-Random
            materialsUsed = $materials | Get-Random
            issues = $issues | Get-Random
        } | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "$API_BASE/daily-reports" -Method POST -Headers $headers -Body $reportData
            Write-Host "  [OK] Report for $reportDate [ID: $($response.id)]" -ForegroundColor Green
            $createdCount++
            $createdReportIds += $response.id
            Start-Sleep -Milliseconds 100
        } catch {
            $errorMsg = $_.ErrorDetails.Message
            Write-Host "  [FAIL] $reportDate" -ForegroundColor Red
            Write-Host "    Error: $errorMsg" -ForegroundColor DarkRed
        }
    }
}

# Save report IDs
$outputData = @{
    reportIds = $createdReportIds
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
} | ConvertTo-Json

$outputPath = "scripts\_report_ids.json"
$outputData | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host "`n=== DAILY REPORTS SEEDING COMPLETE ===" -ForegroundColor Green
Write-Host "Created: $createdCount reports" -ForegroundColor Cyan
Write-Host "Report IDs saved to: $outputPath" -ForegroundColor Gray
