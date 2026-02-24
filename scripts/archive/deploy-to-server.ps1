# PowerShell Script to deploy backend files via SCP
# Run this script from the project root directory

$ServerIP = "103.200.20.100"
$ServerUser = "root"
$ServerPassword = "6k4BOIRDwWhsM39F2DyM"
$RemotePath = "/var/www/baotienweb-api/src"
$LocalPath = Join-Path $PSScriptRoot "backend-files"

Write-Host "========================================"
Write-Host "🚀 Backend Deployment Script"
Write-Host "========================================"
Write-Host ""

# Check if files exist
if (-not (Test-Path $LocalPath)) {
    Write-Host "❌ Error: backend-files directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Local files to deploy:"
Get-ChildItem -Path $LocalPath -Recurse -File | ForEach-Object {
    Write-Host "  - $($_.FullName.Replace($LocalPath, ''))"
}

Write-Host ""
Write-Host "📋 Deployment Instructions" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""
Write-Host "Since Windows SSH requires manual password entry, please follow these steps:"
Write-Host ""
Write-Host "1. Open a new terminal and run:" -ForegroundColor Yellow
Write-Host "   ssh $ServerUser@$ServerIP"
Write-Host ""
Write-Host "2. Enter password: $ServerPassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Once connected, run these commands:" -ForegroundColor Yellow
Write-Host ""

$commands = @"
# Create directories
mkdir -p /var/www/baotienweb-api/src/profile/dto
mkdir -p /var/www/baotienweb-api/src/notifications/dto
mkdir -p /var/www/baotienweb-api/uploads/avatars
chmod 755 /var/www/baotienweb-api/uploads
chmod 755 /var/www/baotienweb-api/uploads/avatars

# Navigate to backend directory
cd /var/www/baotienweb-api
"@

Write-Host $commands -ForegroundColor Gray
Write-Host ""
Write-Host "4. Use nano/vim to create each file, or use the deploy-backend.sh script"
Write-Host ""

# Alternative: Try using pscp if PuTTY is installed
$pscpPath = "C:\Program Files\PuTTY\pscp.exe"
if (Test-Path $pscpPath) {
    Write-Host "🔧 PuTTY found! Attempting SCP upload..." -ForegroundColor Green
    Write-Host ""
    
    # Upload profile files
    Write-Host "Uploading profile module..."
    & $pscpPath -pw $ServerPassword -r "$LocalPath\profile" "${ServerUser}@${ServerIP}:$RemotePath/"
    
    # Upload notifications files
    Write-Host "Uploading notifications module..."
    & $pscpPath -pw $ServerPassword -r "$LocalPath\notifications" "${ServerUser}@${ServerIP}:$RemotePath/"
    
    Write-Host ""
    Write-Host "✅ Files uploaded! Now SSH to restart the server:" -ForegroundColor Green
    Write-Host "   ssh $ServerUser@$ServerIP"
    Write-Host "   cd /var/www/baotienweb-api"
    Write-Host "   npm run build"
    Write-Host "   pm2 restart baotienweb-api"
}
else {
    Write-Host "💡 Tip: Install PuTTY for automatic file upload:" -ForegroundColor Yellow
    Write-Host "   winget install PuTTY.PuTTY"
    Write-Host ""
    Write-Host "Or use the deploy-backend.sh script on the server."
}

Write-Host ""
Write-Host "========================================"
Write-Host "📖 See BACKEND_DEPLOYMENT_MANUAL.md for detailed instructions"
Write-Host "========================================"
