# Fix MEP checklist items - Add checklistId and fix status
$filePath = "app\projects\[id]\qc-qa\checklist\mep.tsx"
$content = Get-Content -Path $filePath  -Encoding UTF8

# Pattern 1: Add checklistId after opening brace for each item
# Pattern 2: Change 'PENDING' as InspectionStatus → InspectionStatus.PENDING

$newContent = @()
$inItem = $false
$needsChecklistId = $false

for ($i = 0; $i -lt $content.Length; $i++) {
    $line = $content[$i]
    
    # Detect item start: line with only "  {"
    if ($line -match '^\s\s\{$' -and $i -gt 0 -and $content[$i-1] -match '// |^\s*$|Columns|Electrical|Plumbing|HVAC|Fire|Other') {
        $inItem = $true
        $needsChecklistId = $true
        $newContent += $line
        continue
    }
    
    # Add checklistId after category line
    if ($needsChecklistId -and $line -match "^\s+category:") {
        $newContent += $line
        $newContent += "    checklistId: 'mep-checklist',"
        $needsChecklistId = $false
        continue
    }
    
    # Fix status line
    if ($line -match "status: 'PENDING' as InspectionStatus,") {
        $newContent += $line -replace "status: 'PENDING' as InspectionStatus,", "status: InspectionStatus.PENDING,"
        continue
    }
    
    # Default: keep line as-is
    $newContent += $line
}

# Write back
$newContent | Set-Content -Path $filePath -Encoding UTF8

Write-Host "Fixed MEP checklist items"
