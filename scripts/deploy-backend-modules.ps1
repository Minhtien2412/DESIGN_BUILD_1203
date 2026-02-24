# ============================================================================
# Deploy Backend Modules to Server
# ============================================================================
# Script này sẽ upload các file backend modules lên server qua SCP
# Yêu cầu: SSH password cho root@103.200.20.100
# ============================================================================

param(
    [string]$ServerIP = "103.200.20.100",
    [string]$ServerUser = "root",
    [string]$ServerPath = "/root/baotienweb-api"
)

$ErrorActionPreference = "Continue"
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT SCRIPT - Services & Utilities Modules" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Đường dẫn local
$LocalBackendCodePath = "$PSScriptRoot\..\docs\backend-code"
$ServerAddress = "$ServerUser@$ServerIP"

Write-Host "📁 Local Path: $LocalBackendCodePath" -ForegroundColor Yellow
Write-Host "🌐 Server: $ServerAddress" -ForegroundColor Yellow
Write-Host "📂 Remote Path: $ServerPath" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra file local tồn tại
Write-Host "🔍 Checking local files..." -ForegroundColor Cyan
$requiredFiles = @(
    "services.controller.ts",
    "services.service.ts",
    "services.module.ts",
    "services.dto.ts",
    "utilities.controller.ts",
    "utilities.service.ts",
    "utilities.module.ts",
    "utilities.dto.ts",
    "seed-admin.ts"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $LocalBackendCodePath $file
    if (Test-Path $filePath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NOT FOUND" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Some files are missing. Please check docs/backend-code/ directory." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT OPTIONS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose deployment method:" -ForegroundColor Yellow
Write-Host "  1. SCP Upload (Recommended - requires SSH/SCP tools)" -ForegroundColor White
Write-Host "  2. Manual Copy-Paste (Show file contents for manual paste)" -ForegroundColor White
Write-Host "  3. Show SSH Commands Only (You run them manually)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        # ========================================================================
        # OPTION 1: SCP UPLOAD
        # ========================================================================
        Write-Host ""
        Write-Host "============================================================================" -ForegroundColor Cyan
        Write-Host "  OPTION 1: SCP Upload" -ForegroundColor Cyan
        Write-Host "============================================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  You will be prompted for SSH password multiple times." -ForegroundColor Yellow
        Write-Host ""
        
        # Create remote directories first
        Write-Host "📁 Creating remote directories..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Run these commands manually in a separate SSH session:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "ssh $ServerAddress" -ForegroundColor White
        Write-Host "cd $ServerPath" -ForegroundColor White
        Write-Host "mkdir -p src/services/dto" -ForegroundColor White
        Write-Host "mkdir -p src/utilities/dto" -ForegroundColor White
        Write-Host "exit" -ForegroundColor White
        Write-Host ""
        
        $ready = Read-Host "Have you created the directories? (y/n)"
        if ($ready -ne "y") {
            Write-Host "❌ Deployment cancelled." -ForegroundColor Red
            exit 0
        }
        
        Write-Host ""
        Write-Host "📤 Uploading Services Module..." -ForegroundColor Cyan
        
        # Upload Services files
        scp "$LocalBackendCodePath\services.controller.ts" "${ServerAddress}:${ServerPath}/src/services/"
        scp "$LocalBackendCodePath\services.service.ts" "${ServerAddress}:${ServerPath}/src/services/"
        scp "$LocalBackendCodePath\services.module.ts" "${ServerAddress}:${ServerPath}/src/services/"
        scp "$LocalBackendCodePath\services.dto.ts" "${ServerAddress}:${ServerPath}/src/services/dto/index.ts"
        
        Write-Host ""
        Write-Host "📤 Uploading Utilities Module..." -ForegroundColor Cyan
        
        # Upload Utilities files
        scp "$LocalBackendCodePath\utilities.controller.ts" "${ServerAddress}:${ServerPath}/src/utilities/"
        scp "$LocalBackendCodePath\utilities.service.ts" "${ServerAddress}:${ServerPath}/src/utilities/"
        scp "$LocalBackendCodePath\utilities.module.ts" "${ServerAddress}:${ServerPath}/src/utilities/"
        scp "$LocalBackendCodePath\utilities.dto.ts" "${ServerAddress}:${ServerPath}/src/utilities/dto/index.ts"
        
        Write-Host ""
        Write-Host "📤 Uploading Seed Script..." -ForegroundColor Cyan
        scp "$LocalBackendCodePath\seed-admin.ts" "${ServerAddress}:${ServerPath}/prisma/"
        
        Write-Host ""
        Write-Host "✅ Upload completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "  1. SSH to server: ssh $ServerAddress" -ForegroundColor White
        Write-Host "  2. Generate Prisma: cd $ServerPath && npx prisma generate" -ForegroundColor White
        Write-Host "  3. Run migration: npx prisma migrate dev --name add_services_utilities" -ForegroundColor White
        Write-Host "  4. Update app.module.ts (add ServicesModule, UtilitiesModule)" -ForegroundColor White
        Write-Host "  5. Build: npm run build" -ForegroundColor White
        Write-Host "  6. Restart: pm2 restart baotienweb-api" -ForegroundColor White
        Write-Host ""
    }
    
    "2" {
        # ========================================================================
        # OPTION 2: MANUAL COPY-PASTE
        # ========================================================================
        Write-Host ""
        Write-Host "============================================================================" -ForegroundColor Cyan
        Write-Host "  OPTION 2: Manual Copy-Paste" -ForegroundColor Cyan
        Write-Host "============================================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "I will display each file content. You can copy and paste to server." -ForegroundColor Yellow
        Write-Host ""
        
        foreach ($file in $requiredFiles) {
            Write-Host ""
            Write-Host "========================================================================" -ForegroundColor Magenta
            Write-Host "  FILE: $file" -ForegroundColor Magenta
            Write-Host "========================================================================" -ForegroundColor Magenta
            Write-Host ""
            
            $filePath = Join-Path $LocalBackendCodePath $file
            $content = Get-Content $filePath -Raw
            
            # Determine remote path
            $remotePath = switch -Wildcard ($file) {
                "services.controller.ts" { "$ServerPath/src/services/services.controller.ts" }
                "services.service.ts" { "$ServerPath/src/services/services.service.ts" }
                "services.module.ts" { "$ServerPath/src/services/services.module.ts" }
                "services.dto.ts" { "$ServerPath/src/services/dto/index.ts" }
                "utilities.controller.ts" { "$ServerPath/src/utilities/utilities.controller.ts" }
                "utilities.service.ts" { "$ServerPath/src/utilities/utilities.service.ts" }
                "utilities.module.ts" { "$ServerPath/src/utilities/utilities.module.ts" }
                "utilities.dto.ts" { "$ServerPath/src/utilities/dto/index.ts" }
                "seed-admin.ts" { "$ServerPath/prisma/seed-admin.ts" }
            }
            
            Write-Host "📍 Remote Path: $remotePath" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "🔽 SSH Command:" -ForegroundColor Cyan
            Write-Host "cat > $remotePath << 'EOF'" -ForegroundColor White
            Write-Host ""
            Write-Host "📄 File Content:" -ForegroundColor Cyan
            Write-Host $content -ForegroundColor Gray
            Write-Host ""
            Write-Host "🔼 After pasting, type:" -ForegroundColor Cyan
            Write-Host "EOF" -ForegroundColor White
            Write-Host ""
            
            $continue = Read-Host "Press Enter to show next file (or 'q' to quit)"
            if ($continue -eq 'q') {
                break
            }
        }
        
        Write-Host ""
        Write-Host "✅ All file contents displayed!" -ForegroundColor Green
    }
    
    "3" {
        # ========================================================================
        # OPTION 3: SHOW SSH COMMANDS
        # ========================================================================
        Write-Host ""
        Write-Host "============================================================================" -ForegroundColor Cyan
        Write-Host "  OPTION 3: SSH Commands" -ForegroundColor Cyan
        Write-Host "============================================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Copy and run these commands in your SSH session:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 1: Connect to Server" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "ssh $ServerAddress" -ForegroundColor White
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 2: Navigate to Project" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "cd $ServerPath" -ForegroundColor White
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 3: Generate Prisma Client" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "npx prisma generate" -ForegroundColor White
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 4: Run Migration" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "npx prisma migrate dev --name add_services_utilities_modules" -ForegroundColor White
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 5: Create Module Directories" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "mkdir -p src/services/dto" -ForegroundColor White
        Write-Host "mkdir -p src/utilities/dto" -ForegroundColor White
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 6: Create Files (use nano or cat with heredoc from local files)" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# Then copy content from local files in docs/backend-code/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 7: Update app.module.ts" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "nano src/app.module.ts" -ForegroundColor White
        Write-Host "# Add: import { ServicesModule } from './services/services.module';" -ForegroundColor Yellow
        Write-Host "# Add: import { UtilitiesModule } from './utilities/utilities.module';" -ForegroundColor Yellow
        Write-Host "# Add to imports array: ServicesModule, UtilitiesModule" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 8: Build Project" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "npm run build" -ForegroundColor White
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 9: Restart PM2" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "pm2 restart baotienweb-api" -ForegroundColor White
        Write-Host "pm2 logs baotienweb-api --lines 50" -ForegroundColor White
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 10: Test APIs" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "curl https://baotienweb.cloud/api/v1/services" -ForegroundColor White
        Write-Host "curl https://baotienweb.cloud/api/v1/utilities" -ForegroundColor White
        Write-Host ""
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "# STEP 11: Seed Data (Optional)" -ForegroundColor Gray
        Write-Host "# ========================================================================" -ForegroundColor Gray
        Write-Host "npx ts-node prisma/seed-admin.ts" -ForegroundColor White
        Write-Host ""
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "     - docs/DEPLOYMENT_STEPS.md" -ForegroundColor White
Write-Host "     - docs/QUICK_DEPLOY.sh" -ForegroundColor White
Write-Host "     - docs/ADMIN_FEATURES_SUMMARY.md" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Script completed!" -ForegroundColor Green
Write-Host ""
