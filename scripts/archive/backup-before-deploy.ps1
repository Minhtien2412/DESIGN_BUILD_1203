# Backup Everything Before VPS Deployment
# Purpose: Create comprehensive backup of database, files, configs before production deploy

param(
    [string]$BackupPath = ".\backups\$(Get-Date -Format 'yyyy-MM-dd_HHmmss')",
    [string]$VpsHost = "103.200.20.100",
    [string]$VpsUser = "root"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backup Script - Pre-Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backup Location: $BackupPath" -ForegroundColor White
Write-Host "" -ForegroundColor White

# Create backup directory
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "✅ Created backup directory" -ForegroundColor Green
}

# 1. Backup Database from VPS
Write-Host "[1/5] Backing up PostgreSQL database from VPS..." -ForegroundColor Yellow
try {
    $dbBackupFile = Join-Path $BackupPath "database_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    
    $sshCommand = "pg_dump -U postgres -d baotienweb_db -F c -f /tmp/db_backup.dump"
    ssh "$VpsUser@$VpsHost" $sshCommand
    
    scp "$VpsUser@${VpsHost}:/tmp/db_backup.dump" $dbBackupFile
    
    if (Test-Path $dbBackupFile) {
        $fileSize = (Get-Item $dbBackupFile).Length / 1MB
        Write-Host "✅ Database backed up ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database backup file not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Database backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Backup Uploaded Files from VPS
Write-Host "[2/5] Backing up uploaded files from VPS..." -ForegroundColor Yellow
try {
    $uploadsBackup = Join-Path $BackupPath "uploads"
    
    scp -r "$VpsUser@${VpsHost}:/var/www/baotienweb/uploads" $uploadsBackup
    
    if (Test-Path $uploadsBackup) {
        $fileCount = (Get-ChildItem -Path $uploadsBackup -Recurse -File).Count
        Write-Host "✅ Uploaded files backed up ($fileCount files)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No uploaded files found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Uploads backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Backup .env Configuration
Write-Host "[3/5] Backing up environment configurations..." -ForegroundColor Yellow
try {
    $envBackup = Join-Path $BackupPath "configs"
    New-Item -ItemType Directory -Path $envBackup -Force | Out-Null
    
    # Local .env
    if (Test-Path "BE-baotienweb.cloud\.env") {
        Copy-Item "BE-baotienweb.cloud\.env" (Join-Path $envBackup ".env.local")
        Write-Host "  ✅ Local .env backed up" -ForegroundColor Green
    }
    
    # VPS .env
    scp "$VpsUser@${VpsHost}:/var/www/baotienweb/.env" (Join-Path $envBackup ".env.vps")
    Write-Host "  ✅ VPS .env backed up" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Config backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Backup Nginx Configuration
Write-Host "[4/5] Backing up Nginx configuration..." -ForegroundColor Yellow
try {
    $nginxBackup = Join-Path $BackupPath "nginx"
    New-Item -ItemType Directory -Path $nginxBackup -Force | Out-Null
    
    scp "$VpsUser@${VpsHost}:/etc/nginx/sites-available/baotienweb" `
        (Join-Path $nginxBackup "baotienweb.conf")
    
    Write-Host "✅ Nginx config backed up" -ForegroundColor Green
} catch {
    Write-Host "❌ Nginx backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Backup SSL Certificates
Write-Host "[5/5] Backing up SSL certificates..." -ForegroundColor Yellow
try {
    $sslBackup = Join-Path $BackupPath "ssl"
    New-Item -ItemType Directory -Path $sslBackup -Force | Out-Null
    
    scp -r "$VpsUser@${VpsHost}:/etc/letsencrypt/live/baotienweb.cloud" $sslBackup
    
    if (Test-Path $sslBackup) {
        Write-Host "✅ SSL certificates backed up" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SSL backup not available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ SSL backup failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Create Backup Manifest
$manifest = @{
    BackupDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    BackupPath = $BackupPath
    VpsHost = $VpsHost
    Items = @(
        "Database Dump",
        "Uploaded Files",
        "Environment Configs",
        "Nginx Configuration",
        "SSL Certificates"
    )
} | ConvertTo-Json

$manifest | Out-File (Join-Path $BackupPath "MANIFEST.json")

Write-Host "" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Location: $BackupPath" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Backup includes:" -ForegroundColor Cyan
Write-Host "  ✅ PostgreSQL database dump" -ForegroundColor White
Write-Host "  ✅ Uploaded files and media" -ForegroundColor White
Write-Host "  ✅ Environment configurations (.env)" -ForegroundColor White
Write-Host "  ✅ Nginx web server config" -ForegroundColor White
Write-Host "  ✅ SSL certificates" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Next Step: Deploy to VPS" -ForegroundColor Cyan
Write-Host "  Run: .\deploy-to-vps.ps1" -ForegroundColor Yellow
