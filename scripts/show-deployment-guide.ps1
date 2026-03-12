# ============================================================================
# Quick Deployment Guide - Interactive
# ============================================================================

$ErrorActionPreference = "Stop"

function Show-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "============================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Step {
    param(
        [int]$StepNumber,
        [string]$Title,
        [string[]]$Commands
    )
    
    Write-Host "BUOC $StepNumber`: $Title" -ForegroundColor Yellow
    Write-Host ""
    foreach ($cmd in $Commands) {
        if ($cmd.StartsWith("#")) {
            Write-Host $cmd -ForegroundColor Gray
        } else {
            Write-Host "  $cmd" -ForegroundColor White
        }
    }
    Write-Host ""
}

Clear-Host
Show-Header "HƯỚNG DẪN DEPLOYMENT - ADMIN MODULES"

Write-Host "Chọn phương án deployment:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1️⃣  Deployment Đầy Đủ (Prisma + Modules + Test)" -ForegroundColor White
Write-Host "  2️⃣  Chỉ Upload Files (Skip Prisma Migration)" -ForegroundColor White
Write-Host "  3️⃣  Chỉ Xem Lệnh SSH (Manual)" -ForegroundColor White
Write-Host "  4️⃣  Test API Endpoints" -ForegroundColor White
Write-Host "  5️⃣  Xem File Structure" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1-5)"

switch ($choice) {
    "1" {
        Show-Header "DEPLOYMENT ĐẦY ĐỦ"
        
        Show-Step 1 "Kết nối SSH" @(
            "ssh root@103.200.20.100",
            "# Nhập password khi được yêu cầu"
        )
        
        Show-Step 2 "Di chuyển vào thư mục project" @(
            "cd /root/baotienweb-api"
        )
        
        Show-Step 3 "Generate Prisma Client" @(
            "npx prisma generate",
            "# Prisma sẽ generate types cho Service và Utility models"
        )
        
        Show-Step 4 "Chạy Migration" @(
            "npx prisma migrate dev --name add_services_utilities_modules",
            "# Tạo tables: services, utilities",
            "# Tạo enums: ServiceCategory, ServiceStatus, UtilityType"
        )
        
        Show-Step 5 "Tạo thư mục modules" @(
            "mkdir -p src/services/dto",
            "mkdir -p src/utilities/dto"
        )
        
        Show-Step 6 "Upload files từ local" @(
            "# Mở PowerShell LOCAL (không phải SSH) và chạy:",
            "cd c:\tien\APP_DESIGN_BUILD15.11.2025",
            ".\scripts\deploy-backend-modules.ps1",
            "# Chọn option 1 (SCP Upload)"
        )
        
        Show-Step 7 "Verify files đã upload" @(
            "# Quay lại SSH session",
            "ls -la src/services/",
            "ls -la src/services/dto/",
            "ls -la src/utilities/",
            "ls -la src/utilities/dto/"
        )
        
        Show-Step 8 "Update app.module.ts" @(
            "nano src/app.module.ts",
            "",
            "# Them 2 dong import o dau file:",
            "# import { ServicesModule } from './services/services.module';",
            "# import { UtilitiesModule } from './utilities/utilities.module';",
            "",
            "# Them vao imports array:",
            "# imports: [",
            "#   // ... existing modules",
            "#   ServicesModule,",
            "#   UtilitiesModule,",
            "# ],",
            "",
            "# Luu: Ctrl+O, Enter, Ctrl+X"
        )
        
        Show-Step 9 "Verify app.module.ts" @(
            "cat src/app.module.ts | grep -E 'ServicesModule|UtilitiesModule'",
            "# Phải thấy 2 dòng import và 2 dòng trong imports array"
        )
        
        Show-Step 10 "Build project" @(
            "npm run build",
            "# Kiểm tra không có lỗi compile"
        )
        
        Show-Step 11 "Restart PM2" @(
            "pm2 restart baotienweb-api",
            "pm2 status",
            "pm2 logs baotienweb-api --lines 50"
        )
        
        Show-Step 12 "Test API Endpoints" @(
            "# Test Services",
            "curl https://baotienweb.cloud/api/v1/services",
            "",
            "# Test Utilities", 
            "curl https://baotienweb.cloud/api/v1/utilities",
            "",
            "# Nếu trả về [] hoặc {data: [], meta: {...}} thì thành công!"
        )
        
        Show-Step 13 "Seed Sample Data (Optional)" @(
            "npx ts-node prisma/seed-admin.ts",
            "# Tạo 12 services + 11 utilities mẫu"
        )
        
        Write-Host "✅ HOÀN THÀNH DEPLOYMENT!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Bước tiếp theo:" -ForegroundColor Yellow
        Write-Host "  1. Test frontend app: Mở Admin Dashboard" -ForegroundColor White
        Write-Host "  2. Vào Services Management → Tạo service mới" -ForegroundColor White
        Write-Host "  3. Vào Utilities Management → Tạo utility mới" -ForegroundColor White
        Write-Host ""
    }
    
    "2" {
        Show-Header "CHỈ UPLOAD FILES"
        
        Write-Host "Sử dụng khi đã chạy Prisma migration rồi" -ForegroundColor Yellow
        Write-Host ""
        
        Show-Step 1 "Tạo thư mục trên server" @(
            "ssh root@103.200.20.100",
            "cd /root/baotienweb-api",
            "mkdir -p src/services/dto",
            "mkdir -p src/utilities/dto"
        )
        
        Show-Step 2 "Upload files từ local" @(
            "# Mở PowerShell LOCAL",
            "cd c:\tien\APP_DESIGN_BUILD15.11.2025",
            ".\scripts\deploy-backend-modules.ps1",
            "# Chọn option 1"
        )
        
        Show-Step 3 "Update app.module.ts và build" @(
            "# Xem bước 8-11 ở option 1"
        )
    }
    
    "3" {
        Show-Header "XEM LỆNH SSH MANUAL"
        
        $docsPath = Join-Path $PSScriptRoot "..\docs"
        $quickDeployPath = Join-Path $docsPath "QUICK_DEPLOY.sh"
        $deploymentStepsPath = Join-Path $docsPath "DEPLOYMENT_STEPS.md"
        
        Write-Host "📄 File hướng dẫn chi tiết:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  1. QUICK_DEPLOY.sh - 22 blocks lệnh copy-paste" -ForegroundColor White
        Write-Host "     Path: $quickDeployPath" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. DEPLOYMENT_STEPS.md - Hướng dẫn đầy đủ" -ForegroundColor White
        Write-Host "     Path: $deploymentStepsPath" -ForegroundColor Gray
        Write-Host ""
        
        $open = Read-Host "Mo file nao? (1/2/n)"
        
        switch ($open) {
            "1" {
                if (Test-Path $quickDeployPath) {
                    code $quickDeployPath
                    Write-Host "✅ Đã mở QUICK_DEPLOY.sh trong VS Code" -ForegroundColor Green
                }
            }
            "2" {
                if (Test-Path $deploymentStepsPath) {
                    code $deploymentStepsPath
                    Write-Host "✅ Đã mở DEPLOYMENT_STEPS.md trong VS Code" -ForegroundColor Green
                }
            }
        }
    }
    
    "4" {
        Show-Header "TEST API ENDPOINTS"
        
        Write-Host "Yêu cầu: Backend đã được deploy và đang chạy" -ForegroundColor Yellow
        Write-Host ""
        
        Show-Step 1 "Login để lấy token" @(
            'curl -X POST "https://baotienweb.cloud/api/v1/auth/login" \',
            '  -H "Content-Type: application/json" \',
            '  -d ''{"email":"admin@test.com","password":"123456"}''',
            "",
            "# Copy access_token từ response"
        )
        
        Show-Step 2 "Test Services Endpoints" @(
            '# Set token (thay YOUR_TOKEN)',
            '$TOKEN="YOUR_TOKEN"',
            "",
            "# GET all services",
            'curl -X GET "https://baotienweb.cloud/api/v1/services"',
            "",
            "# GET service by ID",
            'curl -X GET "https://baotienweb.cloud/api/v1/services/1"',
            "",
            "# CREATE service (cần auth)",
            'curl -X POST "https://baotienweb.cloud/api/v1/services" \',
            '  -H "Authorization: Bearer $TOKEN" \',
            '  -H "Content-Type: application/json" \',
            '  -d ''{"name":"Test Service","category":"DESIGN","price":500000,"unit":"m²","description":"Test"}''',
            "",
            "# UPDATE service",
            'curl -X PATCH "https://baotienweb.cloud/api/v1/services/1" \',
            '  -H "Authorization: Bearer $TOKEN" \',
            '  -d ''{"price":550000}''',
            "",
            "# DELETE service",
            'curl -X DELETE "https://baotienweb.cloud/api/v1/services/1" \',
            '  -H "Authorization: Bearer $TOKEN"'
        )
        
        Show-Step 3 "Test Utilities Endpoints" @(
            "# GET all utilities",
            'curl -X GET "https://baotienweb.cloud/api/v1/utilities"',
            "",
            "# CREATE utility",
            'curl -X POST "https://baotienweb.cloud/api/v1/utilities" \',
            '  -H "Authorization: Bearer $TOKEN" \',
            '  -d ''{"name":"Test","type":"CALCULATOR","icon":"calculator-outline","color":"#3B82F6","route":"/test","description":"Test"}''',
            "",
            "# TOGGLE enabled",
            'curl -X PATCH "https://baotienweb.cloud/api/v1/utilities/1/toggle-enabled" \',
            '  -H "Authorization: Bearer $TOKEN"'
        )
        
        Show-Step 4 "Test Swagger UI" @(
            "# Mở browser:",
            "https://baotienweb.cloud/api/docs",
            "",
            "# Tìm sections:",
            "  - Construction Services (6 endpoints)",
            "  - App Utilities (7 endpoints)"
        )
    }
    
    "5" {
        Show-Header "FILE STRUCTURE"
        
        Write-Host "Local Files (Ready to Deploy):" -ForegroundColor Yellow
        Write-Host ""
        
        $tree = @"
c:\tien\APP_DESIGN_BUILD15.11.2025\
├── docs\
│   ├── backend-code\
│   │   ├── services.controller.ts      ✅ 84 lines
│   │   ├── services.service.ts         ✅ 158 lines  
│   │   ├── services.module.ts          ✅ 11 lines
│   │   ├── services.dto.ts             ✅ 145 lines
│   │   ├── utilities.controller.ts     ✅ 100 lines
│   │   ├── utilities.service.ts        ✅ 226 lines
│   │   ├── utilities.module.ts         ✅ 11 lines
│   │   ├── utilities.dto.ts            ✅ 151 lines
│   │   └── seed-admin.ts               ✅ 250 lines
│   │
│   ├── DEPLOYMENT_STEPS.md             📖 Chi tiết deployment
│   ├── QUICK_DEPLOY.sh                 📖 Quick commands
│   └── ADMIN_FEATURES_SUMMARY.md       📖 Tổng hợp features
│
├── app\admin\
│   ├── dashboard.tsx                   ✅ Frontend complete
│   ├── services\
│   │   ├── index.tsx                   ✅ List view
│   │   └── create.tsx                  ✅ Form
│   └── utilities\
│       ├── index.tsx                   ✅ List view
│       └── create.tsx                  ✅ Form
│
└── services\api\
    ├── services.service.ts             ✅ API client
    └── utilities.service.ts            ✅ API client
"@
        
        Write-Host $tree -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Server Target Paths:" -ForegroundColor Yellow
        Write-Host ""
        
        $serverTree = @"
/root/baotienweb-api/
├── src/
│   ├── services/
│   │   ├── services.controller.ts      ⏳ To upload
│   │   ├── services.service.ts         ⏳ To upload
│   │   ├── services.module.ts          ⏳ To upload
│   │   └── dto/
│   │       └── index.ts                ⏳ To upload (from services.dto.ts)
│   │
│   ├── utilities/
│   │   ├── utilities.controller.ts     ⏳ To upload
│   │   ├── utilities.service.ts        ⏳ To upload
│   │   ├── utilities.module.ts         ⏳ To upload
│   │   └── dto/
│   │       └── index.ts                ⏳ To upload (from utilities.dto.ts)
│   │
│   └── app.module.ts                   ⏳ Need to update
│
├── prisma/
│   ├── schema.prisma                   ✅ Already updated
│   └── seed-admin.ts                   ⏳ To upload
│
└── package.json
"@
        
        Write-Host $serverTree -ForegroundColor Gray
        Write-Host ""
    }
    
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Need help? Run: .\scripts\deploy-backend-modules.ps1" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
