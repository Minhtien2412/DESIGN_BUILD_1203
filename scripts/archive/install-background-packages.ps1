# Install packages for background tasks and notifications
Write-Host "📦 Installing background task packages..." -ForegroundColor Cyan

npm install expo-background-fetch expo-task-manager

Write-Host "`n✅ Packages installed successfully!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm start --clear" -ForegroundColor White
Write-Host "2. App will request permissions on first launch" -ForegroundColor White
Write-Host "3. Background tasks will be registered automatically" -ForegroundColor White
