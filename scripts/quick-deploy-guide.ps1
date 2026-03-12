# Quick Deployment Guide - Simple Version
# No emojis, ASCII only

$ErrorActionPreference = "Stop"

function Show-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "============================================================================" -ForegroundColor Cyan
    Write-Host ""
}

Clear-Host
Show-Header "HUONG DAN DEPLOYMENT - ADMIN MODULES"

Write-Host "Chon phuong an deployment:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Deployment Day Du (Prisma + Modules + Test)" -ForegroundColor White
Write-Host "  2. Chi Upload Files (Skip Prisma Migration)" -ForegroundColor White
Write-Host "  3. Chi Xem Lenh SSH (Manual)" -ForegroundColor White
Write-Host "  4. Test API Endpoints" -ForegroundColor White
Write-Host "  5. Xem File Structure" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhap lua chon (1-5)"

switch ($choice) {
    "1" {
        Show-Header "DEPLOYMENT DAY DU"
        
        Write-Host "BUOC 1: Ket noi SSH" -ForegroundColor Yellow
        Write-Host "  ssh root@103.200.20.100" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 2: Di chuyen vao thu muc project" -ForegroundColor Yellow
        Write-Host "  cd /root/baotienweb-api" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 3: Generate Prisma Client" -ForegroundColor Yellow
        Write-Host "  npx prisma generate" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 4: Chay Migration" -ForegroundColor Yellow
        Write-Host "  npx prisma migrate dev --name add_services_utilities_modules" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 5: Tao thu muc modules" -ForegroundColor Yellow
        Write-Host "  mkdir -p src/services/dto" -ForegroundColor White
        Write-Host "  mkdir -p src/utilities/dto" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 6: Upload files tu local" -ForegroundColor Yellow
        Write-Host "  # Mo PowerShell LOCAL va chay:" -ForegroundColor Gray
        Write-Host "  cd c:\tien\APP_DESIGN_BUILD15.11.2025" -ForegroundColor White
        Write-Host "  .\scripts\deploy-backend-modules.ps1" -ForegroundColor White
        Write-Host "  # Chon option 1 (SCP Upload)" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "BUOC 7: Verify files da upload" -ForegroundColor Yellow
        Write-Host "  ls -la src/services/" -ForegroundColor White
        Write-Host "  ls -la src/utilities/" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 8: Update app.module.ts" -ForegroundColor Yellow
        Write-Host "  nano src/app.module.ts" -ForegroundColor White
        Write-Host "  # Them imports va modules" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "BUOC 9: Build project" -ForegroundColor Yellow
        Write-Host "  npm run build" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 10: Restart PM2" -ForegroundColor Yellow
        Write-Host "  pm2 restart baotienweb-api" -ForegroundColor White
        Write-Host "  pm2 logs baotienweb-api --lines 50" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 11: Test API" -ForegroundColor Yellow
        Write-Host "  curl https://baotienweb.cloud/api/v1/services" -ForegroundColor White
        Write-Host "  curl https://baotienweb.cloud/api/v1/utilities" -ForegroundColor White
        Write-Host ""
        
        Write-Host "HOAN THANH!" -ForegroundColor Green
    }
    
    "2" {
        Show-Header "CHI UPLOAD FILES"
        
        Write-Host "BUOC 1: Tao thu muc tren server" -ForegroundColor Yellow
        Write-Host "  ssh root@103.200.20.100" -ForegroundColor White
        Write-Host "  cd /root/baotienweb-api" -ForegroundColor White
        Write-Host "  mkdir -p src/services/dto" -ForegroundColor White
        Write-Host "  mkdir -p src/utilities/dto" -ForegroundColor White
        Write-Host ""
        
        Write-Host "BUOC 2: Upload files" -ForegroundColor Yellow
        Write-Host "  # Mo PowerShell LOCAL" -ForegroundColor Gray
        Write-Host "  cd c:\tien\APP_DESIGN_BUILD15.11.2025" -ForegroundColor White
        Write-Host "  .\scripts\deploy-backend-modules.ps1" -ForegroundColor White
        Write-Host ""
    }
    
    "3" {
        Show-Header "XEM LENH SSH MANUAL"
        
        $docsPath = Join-Path $PSScriptRoot "..\docs"
        $quickDeployPath = Join-Path $docsPath "QUICK_DEPLOY.sh"
        $deploymentStepsPath = Join-Path $docsPath "DEPLOYMENT_STEPS.md"
        
        Write-Host "File huong dan chi tiet:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  1. QUICK_DEPLOY.sh" -ForegroundColor White
        Write-Host "     Path: $quickDeployPath" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. DEPLOYMENT_STEPS.md" -ForegroundColor White
        Write-Host "     Path: $deploymentStepsPath" -ForegroundColor Gray
        Write-Host ""
        
        $open = Read-Host "Mo file nao? (1 hoac 2, n de bo qua)"
        
        if ($open -eq "1") {
            if (Test-Path $quickDeployPath) {
                code $quickDeployPath
                Write-Host "Da mo QUICK_DEPLOY.sh trong VS Code" -ForegroundColor Green
            }
        }
        elseif ($open -eq "2") {
            if (Test-Path $deploymentStepsPath) {
                code $deploymentStepsPath
                Write-Host "Da mo DEPLOYMENT_STEPS.md trong VS Code" -ForegroundColor Green
            }
        }
    }
    
    "4" {
        Show-Header "TEST API ENDPOINTS"
        
        Write-Host "TEST Services:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# GET all services" -ForegroundColor Gray
        Write-Host 'curl -X GET "https://baotienweb.cloud/api/v1/services"' -ForegroundColor White
        Write-Host ""
        Write-Host "# CREATE service (can auth)" -ForegroundColor Gray
        Write-Host 'curl -X POST "https://baotienweb.cloud/api/v1/services" \' -ForegroundColor White
        Write-Host '  -H "Authorization: Bearer YOUR_TOKEN" \' -ForegroundColor White
        Write-Host '  -H "Content-Type: application/json" \' -ForegroundColor White
        Write-Host '  -d ''{"name":"Test","category":"DESIGN","price":500000,"unit":"m2","description":"Test"}''' -ForegroundColor White
        Write-Host ""
        
        Write-Host "TEST Utilities:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# GET all utilities" -ForegroundColor Gray
        Write-Host 'curl -X GET "https://baotienweb.cloud/api/v1/utilities"' -ForegroundColor White
        Write-Host ""
        Write-Host "# CREATE utility" -ForegroundColor Gray
        Write-Host 'curl -X POST "https://baotienweb.cloud/api/v1/utilities" \' -ForegroundColor White
        Write-Host '  -H "Authorization: Bearer YOUR_TOKEN" \' -ForegroundColor White
        Write-Host '  -d ''{"name":"Test","type":"CALCULATOR","icon":"calculator-outline","color":"#3B82F6","route":"/test","description":"Test"}''' -ForegroundColor White
        Write-Host ""
        
        Write-Host "Swagger UI: https://baotienweb.cloud/api/docs" -ForegroundColor Cyan
    }
    
    "5" {
        Show-Header "FILE STRUCTURE"
        
        Write-Host "Local Files (Ready to Deploy):" -ForegroundColor Yellow
        Write-Host @"

docs\backend-code\
  services.controller.ts      (84 lines)
  services.service.ts         (158 lines)  
  services.module.ts          (11 lines)
  services.dto.ts             (145 lines)
  utilities.controller.ts     (100 lines)
  utilities.service.ts        (226 lines)
  utilities.module.ts         (11 lines)
  utilities.dto.ts            (151 lines)
  seed-admin.ts               (250 lines)

"@ -ForegroundColor Gray
        
        Write-Host "Server Target Paths:" -ForegroundColor Yellow
        Write-Host @"

/root/baotienweb-api/src/
  services/
    services.controller.ts
    services.service.ts
    services.module.ts
    dto/index.ts
  utilities/
    utilities.controller.ts
    utilities.service.ts
    utilities.module.ts
    dto/index.ts

"@ -ForegroundColor Gray
    }
    
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Xem huong dan day du:" -ForegroundColor Cyan
Write-Host "  docs\DEPLOYMENT_STEPS.md" -ForegroundColor White
Write-Host "  docs\QUICK_DEPLOY.sh" -ForegroundColor White
Write-Host ""
