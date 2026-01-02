# Seed Project Timeline Phases
$API_BASE = "https://baotienweb.cloud/api/v1"
$EMAIL = "admin2@test.com"
$PASSWORD = "123456"

Write-Host "=== SEEDING PROJECT TIMELINE PHASES ===" -ForegroundColor Cyan

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
    # Use known IDs from seed-projects.ps1 output
    $projectIds = @(4, 5, 6, 7, 8)
    Write-Host "Using hardcoded project IDs: $($projectIds -join ', ')" -ForegroundColor Gray
}

Write-Host "`nCreating timeline phases for $($projectIds.Count) projects..." -ForegroundColor Yellow

# Phase templates (6-8 phases per project)
$phaseTemplates = @(
    @{
        name = "Chuan bi mat bang"
        description = "Giai doan chuan bi mat bang, giai phong, giao mat bang, xin giay phep xay dung"
        status = "COMPLETED"
        progress = 100
        offsetDays = -60  # Started 60 days before project start
        duration = 15
    },
    @{
        name = "Mong - Dao dat"
        description = "Dao dat, dam coc, lam mong, thiet lap chong tham cho tang ham (neu co)"
        status = "COMPLETED"
        progress = 100
        offsetDays = -45
        duration = 20
    },
    @{
        name = "Mong - Do be tong"
        description = "Do be tong long mong, cot thep, lam chong tham tang ham"
        status = "COMPLETED"
        progress = 100
        offsetDays = -25
        duration = 15
    },
    @{
        name = "Ket cau tang 1"
        description = "Thi cong ket cau be tong cot thep tang 1: cot, dam, san, tuong"
        status = "IN_PROGRESS"
        progress = 75
        offsetDays = -10
        duration = 25
    },
    @{
        name = "Ket cau tang 2"
        description = "Thi cong ket cau be tong cot thep tang 2: cot, dam, san, tuong"
        status = "IN_PROGRESS"
        progress = 50
        offsetDays = 15
        duration = 25
    },
    @{
        name = "Ket cau mai va tang tret"
        description = "Thi cong ket cau mai, giai phap chong tham mai, hoan thien ket cau tho"
        status = "PENDING"
        progress = 20
        offsetDays = 40
        duration = 20
    },
    @{
        name = "Hoan thien noi ngoai that"
        description = "Op lat, son, lam tran, cua, lap dat dien nuoc, thiet bi ve sinh"
        status = "PENDING"
        progress = 0
        offsetDays = 60
        duration = 30
    },
    @{
        name = "Nghiem thu ban giao"
        description = "Nghiem thu cong trinh, bao hanh, ban giao cho chu dau tu"
        status = "PENDING"
        progress = 0
        offsetDays = 90
        duration = 10
    }
)

$createdCount = 0
$createdPhaseIds = @()

# Project start dates (matching seed-projects.ps1)
$projectDates = @{
    4 = "2025-01-15"  # Biệt thự Thủ Đức
    5 = "2025-02-01"  # Nhà phố Bình Thạnh
    6 = "2025-03-15"  # Chung cư Gò Vấp (PLANNING)
    7 = "2025-01-20"  # Sửa chữa Q1
    8 = "2025-04-01"  # Nhà xưởng (PLANNING)
}

$planningProjects = @(6, 8)  # Use only 6 phases for planning projects

foreach ($projectId in $projectIds) {
    Write-Host "`n[Project $projectId] Creating phases..." -ForegroundColor Cyan
    
    $projectStartDate = [datetime]::Parse($projectDates[$projectId])
    
    # Use 6 phases for planning, 8 for active projects
    $phasesToCreate = if ($planningProjects -contains $projectId) { $phaseTemplates[0..5] } else { $phaseTemplates }
    
    foreach ($template in $phasesToCreate) {
            $startDate = $projectStartDate.AddDays($template.offsetDays).ToString("yyyy-MM-dd")
            $endDate = $projectStartDate.AddDays($template.offsetDays + $template.duration).ToString("yyyy-MM-dd")
            
            $phaseData = @{
                projectId = $projectId
                name = $template.name
                description = $template.description
                status = $template.status
                startDate = $startDate
                endDate = $endDate
                progress = $template.progress
            } | ConvertTo-Json
            
            try {
                $response = Invoke-RestMethod -Uri "$API_BASE/timeline/phases" -Method POST -Headers $headers -Body $phaseData
                Write-Host "  [OK] $($template.name) [ID: $($response.id)]" -ForegroundColor Green
                $createdCount++
                $createdPhaseIds += $response.id
                Start-Sleep -Milliseconds 150
            } catch {
                $errorMsg = $_.ErrorDetails.Message
                Write-Host "  [FAIL] $($template.name)" -ForegroundColor Red
                Write-Host "    Error: $errorMsg" -ForegroundColor DarkRed
            }
        }
}

# Save phase IDs
$outputData = @{
    phaseIds = $createdPhaseIds
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
} | ConvertTo-Json

$outputPath = "scripts\_phase_ids.json"
$outputData | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host "`n=== TIMELINE SEEDING COMPLETE ===" -ForegroundColor Green
Write-Host "Created: $createdCount phases" -ForegroundColor Cyan
Write-Host "Phase IDs saved to: $outputPath" -ForegroundColor Gray
