# Temporary script to comment out PNG requires for testing

$files = @(
    "app\(tabs)\index.tsx",
    "components\home\mobile-menu-complete.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Comment out icon: require(...png) patterns
        $content = $content -replace '(\s+icon:\s+require\([^)]+\.png["'']\))', ' /* TEMP DISABLED $1 */'
        
        Set-Content $file $content -NoNewline
        Write-Host "[OK] Processed $file" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n[DONE] All PNG requires commented out. Reload app to test UI without icons." -ForegroundColor Cyan
