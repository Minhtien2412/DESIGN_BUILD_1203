# Script to update all filter sections to use FilterModal

$files = @(
    "app\utilities\be-tong.tsx",
    "app\utilities\tho-dien-nuoc.tsx",
    "app\utilities\tho-coffa.tsx",
    "app\utilities\vat-lieu.tsx",
    "app\finishing\tho-tong-hop.tsx",
    "app\finishing\thach-cao.tsx",
    "app\finishing\son.tsx",
    "app\finishing\lat-gach.tsx"
)

Write-Host "Updating filter sections in $($files.Count) files..." -ForegroundColor Green

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw
        
        # Add filterModalVisible state if not exists
        if ($content -notmatch 'filterModalVisible') {
            $content = $content -replace '(const \[showBookingModal, setShowBookingModal\] = useState\(false\);)', '$1`n  const [filterModalVisible, setFilterModalVisible] = useState(false);'
        }
        
        Set-Content -Path $fullPath -Value $content -NoNewline
        Write-Host "  ✓ Updated $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! Updated $($files.Count) files." -ForegroundColor Green
Write-Host "Note: You still need to manually update the UI sections and styles." -ForegroundColor Yellow
