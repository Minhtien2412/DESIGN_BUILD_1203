# Activate Optimized Home Screen
# This script backs up the current index.tsx and replaces it with the FlatList version

$projectRoot = "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
$tabsPath = Join-Path $projectRoot "app\(tabs)"

Write-Host "🚀 Activating Optimized Home Screen..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if files exist
$currentIndex = Join-Path $tabsPath "index.tsx"
$flatlistIndex = Join-Path $tabsPath "index-flatlist.tsx"
$backupIndex = Join-Path $tabsPath "index-scrollview-old.tsx"

if (-not (Test-Path $currentIndex)) {
    Write-Host "❌ Error: Current index.tsx not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $flatlistIndex)) {
    Write-Host "❌ Error: Optimized index-flatlist.tsx not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Backup current version
Write-Host "📦 Backing up current index.tsx..." -ForegroundColor Yellow
Copy-Item $currentIndex $backupIndex -Force
Write-Host "   ✓ Backup created: index-scrollview-old.tsx" -ForegroundColor Green
Write-Host ""

# Step 3: Replace with optimized version
Write-Host "⚡ Replacing with optimized FlatList version..." -ForegroundColor Yellow
Copy-Item $flatlistIndex $currentIndex -Force
Write-Host "   ✓ index.tsx updated with FlatList implementation" -ForegroundColor Green
Write-Host ""

# Step 4: Clear cache
Write-Host "🧹 Clearing Expo cache..." -ForegroundColor Yellow
$expoCache = Join-Path $projectRoot ".expo"
$nodeCache = Join-Path $projectRoot "node_modules\.cache"

if (Test-Path $expoCache) {
    Remove-Item $expoCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ .expo cache cleared" -ForegroundColor Green
}

if (Test-Path $nodeCache) {
    Remove-Item $nodeCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ node_modules cache cleared" -ForegroundColor Green
}
Write-Host ""

# Step 5: Summary
Write-Host "✅ Activation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 What changed:" -ForegroundColor Cyan
Write-Host "   • ScrollView → FlatList (60fps scrolling)" -ForegroundColor White
Write-Host "   • Added performance optimizations" -ForegroundColor White
Write-Host "   • Added skeleton loading states" -ForegroundColor White
Write-Host "   • Added empty state component" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npx expo start --clear" -ForegroundColor Yellow
Write-Host "   2. Test scrolling performance" -ForegroundColor White
Write-Host "   3. Verify all navigation works" -ForegroundColor White
Write-Host ""
Write-Host "🔄 To rollback:" -ForegroundColor Cyan
Write-Host "   Copy-Item '$backupIndex' '$currentIndex' -Force" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to start Expo..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Step 6: Start Expo
Set-Location $projectRoot
npx expo start --clear
