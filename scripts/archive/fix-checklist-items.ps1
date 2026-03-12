# Fix Checklist Items - Add checklistId to all items
$filePath = "C:\tien\APP_DESIGN_BUILD15.11.2025\app\projects\[id]\qc-qa\checklist\structure.tsx"
$content = Get-Content $filePath -Raw

# Replace pattern: add checklistId before category
$pattern = '(?m)^\s+\{\s*\n\s+category:'
$replacement = "  {`n    checklistId: 'structure-checklist',`n    category:"

$newContent = $content -replace $pattern, $replacement

# Replace 'PENDING' as InspectionStatus with InspectionStatus.PENDING
$newContent = $newContent -replace "'PENDING' as InspectionStatus", 'InspectionStatus.PENDING'
$newContent = $newContent -replace "'PASS' as InspectionStatus", 'InspectionStatus.PASS'
$newContent = $newContent -replace "'FAIL' as InspectionStatus", 'InspectionStatus.FAIL'
$newContent = $newContent -replace "'NA' as InspectionStatus", 'InspectionStatus.NA'

# Save
Set-Content $filePath -Value $newContent -NoNewline

Write-Host "✅ Fixed structure.tsx checklist items" -ForegroundColor Green
Write-Host "   - Added checklistId to all items"
Write-Host "   - Replaced status strings with enum values"
