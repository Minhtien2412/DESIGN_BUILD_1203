# BaoTienWeb Enum Error Auto-Fix Script
# Version 1.0 - December 6, 2025

param(
    [string]$FilePath,
    [switch]$AllFiles,
    [switch]$DryRun
)

# Enum mappings
$enumMappings = @{
    'PurchaseOrderStatus' = @{
        'SENT' = 'PurchaseOrderStatus.SENT'
        'CONFIRMED' = 'PurchaseOrderStatus.CONFIRMED'
        'PARTIALLY_RECEIVED' = 'PurchaseOrderStatus.PARTIALLY_RECEIVED'
        'RECEIVED' = 'PurchaseOrderStatus.RECEIVED'
    }
    'VendorCategory' = @{
        'MATERIALS' = 'VendorCategory.MATERIALS'
        'EQUIPMENT' = 'VendorCategory.EQUIPMENT'
        'SUBCONTRACTOR' = 'VendorCategory.SUBCONTRACTOR'
        'SERVICES' = 'VendorCategory.SERVICES'
    }
    'VendorStatus' = @{
        'ACTIVE' = 'VendorStatus.ACTIVE'
        'INACTIVE' = 'VendorStatus.INACTIVE'
    }
    'ChangeRequestStatus' = @{
        'SUBMITTED' = 'ChangeRequestStatus.SUBMITTED'
        'UNDER_REVIEW' = 'ChangeRequestStatus.UNDER_REVIEW'
        'APPROVED' = 'ChangeRequestStatus.APPROVED'
        'IMPLEMENTED' = 'ChangeRequestStatus.IMPLEMENTED'
    }
    'InspectionType' = @{
        'FOUNDATION' = 'InspectionType.FOUNDATION'
        'STRUCTURAL' = 'InspectionType.STRUCTURAL'
        'MEP' = 'InspectionType.MEP'
        'ELECTRICAL' = 'InspectionType.ELECTRICAL'
        'PLUMBING' = 'InspectionType.PLUMBING'
        'HVAC' = 'InspectionType.HVAC'
        'FIRE_SAFETY' = 'InspectionType.FIRE_SAFETY'
        'FINAL' = 'InspectionType.FINAL'
    }
    'InspectionStatus' = @{
        'SCHEDULED' = 'InspectionStatus.SCHEDULED'
        'IN_PROGRESS' = 'InspectionStatus.IN_PROGRESS'
        'PASSED' = 'InspectionStatus.PASSED'
        'FAILED' = 'InspectionStatus.FAILED'
        'CONDITIONAL_PASS' = 'InspectionStatus.CONDITIONAL_PASS'
    }
    'TestType' = @{
        'CONCRETE_STRENGTH' = 'TestType.CONCRETE_STRENGTH'
        'SOIL_COMPACTION' = 'TestType.SOIL_COMPACTION'
        'STEEL_QUALITY' = 'TestType.STEEL_QUALITY'
        'WATERPROOFING' = 'TestType.WATERPROOFING'
        'LOAD_TEST' = 'TestType.LOAD_TEST'
        'OTHER' = 'TestType.OTHER'
    }
    'TestStatus' = @{
        'PENDING' = 'TestStatus.PENDING'
        'IN_PROGRESS' = 'TestStatus.IN_PROGRESS'
        'COMPLETED' = 'TestStatus.COMPLETED'
        'PASSED' = 'TestStatus.PASSED'
        'FAILED' = 'TestStatus.FAILED'
    }
}

# Import statements
$enumImports = @{
    'PurchaseOrderStatus' = "import { PurchaseOrderStatus } from '@/types/procurement';"
    'VendorCategory' = "import { VendorCategory } from '@/types/procurement';"
    'VendorStatus' = "import { VendorStatus } from '@/types/procurement';"
    'ChangeRequestStatus' = "import { ChangeRequestStatus } from '@/types/change-management';"
    'InspectionType' = "import { InspectionType } from '@/types/inspection';"
    'InspectionStatus' = "import { InspectionStatus } from '@/types/inspection';"
    'TestType' = "import { TestType } from '@/types/inspection';"
    'TestStatus' = "import { TestStatus } from '@/types/inspection';"
}

function Fix-EnumErrors {
    param([string]$file)
    
    Write-Host "`n[Processing] $file" -ForegroundColor Cyan
    
    if (-not (Test-Path $file)) {
        Write-Host "  [WARNING] File not found" -ForegroundColor Yellow
        return 0
    }
    
    $content = Get-Content $file -Raw -Encoding UTF8
    $changes = 0
    $importsToAdd = @()
    
    foreach ($enumName in $enumMappings.Keys) {
        $enumValues = $enumMappings[$enumName]
        
        foreach ($stringValue in $enumValues.Keys) {
            $enumValue = $enumValues[$stringValue]
            
            # Pattern 1: value: 'STRING'
            $pattern1 = "value:\s*['`"]$stringValue['`"]"
            if ($content -match $pattern1) {
                $content = $content -replace $pattern1, "value: $enumValue"
                $changes++
                if ($importsToAdd -notcontains $enumName) {
                    $importsToAdd += $enumName
                }
            }
            
            # Pattern 2: setState('STRING')
            $pattern2 = "set\w+(?:Filter|Status)\s*\(\s*['`"]$stringValue['`"]\s*\)"
            if ($content -match $pattern2) {
                $content = $content -replace $pattern2, { 
                    $match = $_.Value
                    $funcName = ($match -split '\(')[0]
                    return "$funcName($enumValue)"
                }
                $changes++
                if ($importsToAdd -notcontains $enumName) {
                    $importsToAdd += $enumName
                }
            }
            
            # Pattern 3: === 'STRING'
            $pattern3 = "===\s*['`"]$stringValue['`"]"
            if ($content -match $pattern3) {
                $content = $content -replace $pattern3, "=== $enumValue"
                $changes++
                if ($importsToAdd -notcontains $enumName) {
                    $importsToAdd += $enumName
                }
            }
            
            # Pattern 4: 'STRING' ===
            $pattern4 = "['`"]$stringValue['`"]\s*==="
            if ($content -match $pattern4) {
                $content = $content -replace $pattern4, "$enumValue ==="
                $changes++
                if ($importsToAdd -notcontains $enumName) {
                    $importsToAdd += $enumName
                }
            }
        }
    }
    
    # Add imports
    if ($importsToAdd.Count -gt 0) {
        foreach ($enumName in $importsToAdd) {
            $importStatement = $enumImports[$enumName]
            if ($content -notmatch [regex]::Escape($enumName)) {
                $lines = $content -split "`r?`n"
                $lastImportIndex = -1
                
                for ($i = 0; $i -lt $lines.Count; $i++) {
                    if ($lines[$i] -match "^import ") {
                        $lastImportIndex = $i
                    }
                }
                
                if ($lastImportIndex -ge 0) {
                    $beforeImport = $lines[0..$lastImportIndex] -join "`n"
                    $afterImport = $lines[($lastImportIndex+1)..($lines.Count-1)] -join "`n"
                    $content = $beforeImport + "`n" + $importStatement + "`n" + $afterImport
                    $changes++
                }
            }
        }
    }
    
    if ($changes -gt 0) {
        Write-Host "  [OK] Made $changes changes" -ForegroundColor Green
        
        if (-not $DryRun) {
            Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  [SAVED] File updated" -ForegroundColor Green
        } else {
            Write-Host "  [DRY RUN] Changes not saved" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [INFO] No enum errors found" -ForegroundColor Gray
    }
    
    return $changes
}

# Main execution
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "BaoTienWeb Enum Error Auto-Fix Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$targetFiles = @()

if ($FilePath) {
    $targetFiles = @($FilePath)
} elseif ($AllFiles) {
    $targetFiles = @(
        "app\procurement\index.tsx",
        "app\procurement\vendors.tsx",
        "app\change-management\index.tsx",
        "app\inspection\index.tsx",
        "app\inspection\tests.tsx"
    )
} else {
    Write-Host "[ERROR] Specify -FilePath or -AllFiles" -ForegroundColor Red
    exit 1
}

if ($DryRun) {
    Write-Host "[DRY RUN MODE]`n" -ForegroundColor Yellow
}

$totalChanges = 0
foreach ($file in $targetFiles) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    $totalChanges += Fix-EnumErrors -file $fullPath
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "SUMMARY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Files processed: $($targetFiles.Count)" -ForegroundColor White
Write-Host "Total changes:   $totalChanges`n" -ForegroundColor Cyan

if (-not $DryRun -and $totalChanges -gt 0) {
    Write-Host "Next: npm run typecheck" -ForegroundColor Yellow
}
