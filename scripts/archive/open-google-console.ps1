# Quick Open Google Cloud Console for OAuth Setup
Write-Host "=== GOOGLE CLOUD CONSOLE - OAUTH SETUP ===" -ForegroundColor Cyan
Write-Host ""

# URLs
$credentialsUrl = "https://console.cloud.google.com/apis/credentials"
$consentUrl = "https://console.cloud.google.com/apis/credentials/consent"

Write-Host "📋 THÔNG TIN CẦN DÙNG:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Package Name:" -ForegroundColor White
Write-Host "  com.adminmarketingnx.APP_DESIGN_BUILD" -ForegroundColor Green
Write-Host ""
Write-Host "SHA-1 Certificate (Development):" -ForegroundColor White
Write-Host "  9E:8A:6B:92:12:6E:8D:C3:A2:57:73:B7:D8:49:9C:3A:2F:10:5B:1D" -ForegroundColor Green
Write-Host ""
Write-Host "Bundle ID (iOS):" -ForegroundColor White
Write-Host "  com.adminmarketingnx.APP_DESIGN_BUILD" -ForegroundColor Green
Write-Host ""
Write-Host "Redirect URI:" -ForegroundColor White
Write-Host "  https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 MỞ GOOGLE CLOUD CONSOLE..." -ForegroundColor Cyan
Write-Host ""

# Mở Credentials page
Write-Host "Opening: $credentialsUrl" -ForegroundColor Gray
Start-Process $credentialsUrl

Write-Host ""
Write-Host "✅ ĐÃ MỞ GOOGLE CLOUD CONSOLE!" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 HƯỚNG DẪN NHANH:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. TẠO ANDROID CLIENT ID:" -ForegroundColor White
Write-Host "   • Click '+ CREATE CREDENTIALS' → 'OAuth client ID'" -ForegroundColor Gray
Write-Host "   • Chọn 'Android'" -ForegroundColor Gray
Write-Host "   • Name: Android App" -ForegroundColor Gray
Write-Host "   • Package name: com.adminmarketingnx.APP_DESIGN_BUILD" -ForegroundColor Gray
Write-Host "   • SHA-1: 9E:8A:6B:92:12:6E:8D:C3:A2:57:73:B7:D8:49:9C:3A:2F:10:5B:1D" -ForegroundColor Gray
Write-Host "   • Click CREATE" -ForegroundColor Gray
Write-Host ""

Write-Host "2. TẠO IOS CLIENT ID (Optional):" -ForegroundColor White
Write-Host "   • Click '+ CREATE CREDENTIALS' → 'OAuth client ID'" -ForegroundColor Gray
Write-Host "   • Chọn 'iOS'" -ForegroundColor Gray
Write-Host "   • Name: iOS App" -ForegroundColor Gray
Write-Host "   • Bundle ID: com.adminmarketingnx.APP_DESIGN_BUILD" -ForegroundColor Gray
Write-Host "   • Click CREATE" -ForegroundColor Gray
Write-Host ""

Write-Host "3. CẬP NHẬT .ENV:" -ForegroundColor White
Write-Host "   • Copy Client ID từ Google Console" -ForegroundColor Gray
Write-Host "   • Paste vào .env file:" -ForegroundColor Gray
Write-Host "     EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx" -ForegroundColor Gray
Write-Host "     EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=yyy" -ForegroundColor Gray
Write-Host ""

Write-Host "4. RESTART METRO:" -ForegroundColor White
Write-Host "   npx expo start -c" -ForegroundColor Gray
Write-Host ""

Write-Host "📖 Chi tiết: docs/GOOGLE_OAUTH_QUICK_START.md" -ForegroundColor Cyan
Write-Host ""

# Hỏi có muốn mở OAuth Consent Screen không
Write-Host "Bạn có muốn mở OAuth Consent Screen không? (y/n): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Opening: $consentUrl" -ForegroundColor Gray
    Start-Process $consentUrl
    Write-Host ""
    Write-Host "✅ ĐÃ MỞ OAUTH CONSENT SCREEN!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== END ===" -ForegroundColor Cyan
