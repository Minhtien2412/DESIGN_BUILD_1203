# Upload Custom_api.php to Perfex CRM Server
# Run this script from PowerShell with SSH access

# Configuration
$localFile = "docs\perfex-custom-api\Custom_api.php"
$remoteHost = "nhaxinhd@thietkeresort.com.vn"
$remotePath = "/home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/controllers/Custom_api.php"

Write-Host "=== Uploading Custom_api.php to Perfex CRM Server ===" -ForegroundColor Cyan

# Option 1: Using SCP (if SSH key is configured)
Write-Host "`nOption 1: Using SCP..."
try {
    scp $localFile "${remoteHost}:${remotePath}"
    Write-Host "Upload successful!" -ForegroundColor Green
} catch {
    Write-Host "SCP failed. Try manual upload via FTP/SFTP" -ForegroundColor Yellow
}

# Test endpoint after upload
Write-Host "`n=== Testing API Endpoint ===" -ForegroundColor Cyan
Write-Host "Run this command after upload to test:"
Write-Host 'Invoke-RestMethod -Uri "https://thietkeresort.com.vn/perfex_crm/custom_api/test" -Method GET -Headers @{"X-API-Key"="67890abcdef!@#$%^&*"}' -ForegroundColor Yellow

# Manual upload instructions
Write-Host @"

=== Manual Upload Instructions ===

1. FTP/SFTP:
   - Connect to: thietkeresort.com.vn
   - User: nhaxinhd
   - Upload file: $localFile
   - To: /home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/controllers/

2. cPanel File Manager:
   - Login: https://thietkeresort.com.vn/cpanel
   - Navigate: public_html/perfex_crm/application/controllers/
   - Upload: Custom_api.php

3. SSH:
   ssh nhaxinhd@thietkeresort.com.vn
   # Then paste file content using nano/vi

"@ -ForegroundColor White
