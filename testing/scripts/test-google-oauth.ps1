<#
.SYNOPSIS
    Test Google OAuth integration
    
.DESCRIPTION
    Script để test chức năng đăng nhập Google OAuth với Client ID mới
    
.NOTES
    Created: 2026-01-07
    Client ID: 147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com
#>

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Google OAuth Integration Test" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check .env file
Write-Host "📝 Step 1: Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "EXPO_PUBLIC_GOOGLE_CLIENT_ID=147141134557") {
        Write-Host "✅ Google Client ID is configured correctly" -ForegroundColor Green
    } else {
        Write-Host "❌ Google Client ID not found or incorrect in .env" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🧹 Step 3: Clearing Expo cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Manual Testing Instructions" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Press 'w' to open in web browser" -ForegroundColor White
Write-Host "2️⃣  Navigate to Login screen" -ForegroundColor White
Write-Host "3️⃣  Click 'Đăng nhập với Google' button" -ForegroundColor White
Write-Host "4️⃣  Complete Google OAuth flow" -ForegroundColor White
Write-Host "5️⃣  Check console for success/error logs" -ForegroundColor White
Write-Host ""
Write-Host "Expected Behavior:" -ForegroundColor Yellow
Write-Host "  - Opens Google OAuth consent screen" -ForegroundColor White
Write-Host "  - After selecting account, redirects back to app" -ForegroundColor White
Write-Host "  - Shows success alert with user name/email" -ForegroundColor White
Write-Host "  - Navigates to home screen" -ForegroundColor White
Write-Host ""
Write-Host "Backend Endpoints:" -ForegroundColor Yellow
Write-Host "  POST https://baotienweb.cloud/api/auth/google" -ForegroundColor White
Write-Host "  Body: { token, email, name, picture }" -ForegroundColor White
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "  - If redirect fails, check authorized redirect URIs in Google Console" -ForegroundColor White
Write-Host "  - If backend fails, verify /auth/google endpoint exists" -ForegroundColor White
Write-Host "  - Check Metro bundler logs for errors" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Wait for user to start testing
Read-Host "Press Enter when ready to start Expo..."

# Start Expo with clear cache
Write-Host "🚀 Starting Expo..." -ForegroundColor Green
npx expo start --clear
