# SSH Tunnel Helper Script for Windows
# Creates SSH tunnel to VPS for local development

Write-Host "🔌 Setting up SSH Tunnel to VPS..." -ForegroundColor Cyan
Write-Host ""
Write-Host "VPS: 103.200.20.100" -ForegroundColor Yellow
Write-Host "Local Port: 5000" -ForegroundColor Yellow
Write-Host "Remote Port: 4000" -ForegroundColor Yellow
Write-Host ""
Write-Host "After connection:" -ForegroundColor Green
Write-Host "- API will be available at: http://localhost:5000"
Write-Host "- Update .env: EXPO_PUBLIC_API_BASE_URL=http://localhost:5000"
Write-Host ""
Write-Host "Press Ctrl+C to stop tunnel" -ForegroundColor Red
Write-Host ""

# Check if port is already in use
$portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠️  Port 5000 is already in use!" -ForegroundColor Yellow
    $response = Read-Host "Kill existing process? (y/n)"
    
    if ($response -eq "y") {
        Write-Host "Killing process on port 5000..." -ForegroundColor Yellow
        $process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($process) {
            Stop-Process -Id $process -Force
            Start-Sleep -Seconds 1
        }
    } else {
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

# Check if SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH command not found!" -ForegroundColor Red
    Write-Host "Please install OpenSSH client:" -ForegroundColor Yellow
    Write-Host "Settings > Apps > Optional Features > Add OpenSSH Client" -ForegroundColor Yellow
    exit 1
}

# Start tunnel
Write-Host "Starting SSH tunnel..." -ForegroundColor Cyan
Write-Host "You will be prompted for VPS password..." -ForegroundColor Yellow
Write-Host ""

ssh -L 5000:127.0.0.1:4000 root@103.200.20.100 -N

Write-Host ""
Write-Host "Tunnel closed." -ForegroundColor Red
