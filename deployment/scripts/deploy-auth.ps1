#!/usr/bin/env pwsh
# Deploy auth files to server

$server = "root@103.200.20.100"
$remotePath = "/root/BE-baotienweb.cloud/src/auth/"

Write-Host "Deploying auth files to server..." -ForegroundColor Cyan

# Upload files
scp -o StrictHostKeyChecking=no "BE-baotienweb.cloud/src/auth/auth.controller.ts" "${server}:${remotePath}"
scp -o StrictHostKeyChecking=no "BE-baotienweb.cloud/src/auth/auth.service.ts" "${server}:${remotePath}"

Write-Host "Files uploaded. Rebuilding backend..." -ForegroundColor Yellow

# Rebuild and restart
ssh -o StrictHostKeyChecking=no $server "cd /root/BE-baotienweb.cloud && npm run build && pm2 restart baotienweb-api"

Write-Host "Done!" -ForegroundColor Green
