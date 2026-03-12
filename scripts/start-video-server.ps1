#!/usr/bin/env pwsh
# PowerShell script to start video call server

Write-Host "🚀 Starting Video Call Server..." -ForegroundColor Green

# Change to server directory
Push-Location "server"

try {
    # Start the video call server
    Write-Host "📹 Launching WebRTC signaling server on port 3001..." -ForegroundColor Yellow
    npm run video-call
}
catch {
    Write-Host "❌ Failed to start video call server: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}