# Script to test Metro bundling by requesting the bundle
$port = 8081
$bundleUrl = "http://localhost:$port/node_modules/expo-router/entry.bundle?platform=android&dev=true&minify=false"

Write-Host "Testing Metro bundling..." -ForegroundColor Cyan
Write-Host "URL: $bundleUrl" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $bundleUrl -TimeoutSec 60 -UseBasicParsing
    Write-Host "SUCCESS: Bundle generated!" -ForegroundColor Green
    Write-Host "Bundle size: $($response.Content.Length) bytes" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Bundling error" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
