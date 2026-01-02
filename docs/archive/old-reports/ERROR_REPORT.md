# 🔴 ERROR REPORT - BaoTienWeb Construction App
**Generated:** December 6, 2025  
**Total Errors:** 1,116 TypeScript errors  
**Status:** Critical - Blocking Production Deployment

---

## 📊 EXECUTIVE SUMMARY

### Overview
Full project TypeScript validation discovered **1,116 errors** across **50+ files**. While recently implemented Timeline and Payment features are **error-free** (6 files, 0 errors), the legacy codebase has accumulated significant technical debt that must be addressed before production release.

### Error Distribution
| Category | Count | % of Total | Automation Potential | Est. Fix Time |
|----------|-------|------------|---------------------|---------------|
| **Enum Type Mismatches** | ~400 | 35.8% | ✅ **High** (Script) | 2-3 hours |
| **Icon Type Issues** | ~200 | 17.9% | ✅ **Medium** (Pattern) | 3-4 hours |
| **Missing Hook Properties** | ~300 | 26.9% | ⚠️ **Low** (Manual) | 8-10 hours |
| **DTO Property Conflicts** | ~216 | 19.4% | ⚠️ **Medium** (Mix) | 4-5 hours |

### Impact Assessment
- 🚫 **Production Blocker:** Cannot deploy with TypeScript errors
- ⚠️ **Runtime Risk:** Type errors may cause crashes
- 📉 **Developer Velocity:** Errors slow down feature development
- 🔧 **Maintenance Burden:** Technical debt compounds over time

### Recommended Strategy
1. **Immediate (Today):** Fix top 50 critical errors in high-traffic screens
2. **Short-term (This Week):** Run auto-fix script for enum errors (~400 fixes)
3. **Medium-term (Next Week):** Systematically fix hook/DTO issues
4. **Ongoing:** Enforce strict TypeScript checks in CI/CD

---

## 🎯 PRIORITY MATRIX

### Critical Files (Fix First)
| File | Errors | Priority | User Impact | Fix Complexity |
|------|--------|----------|-------------|----------------|
| `app/inspection/index.tsx` | 14 | 🔴 High | High | Medium |
| `app/inspection/tests.tsx` | 12 | 🔴 High | High | Medium |
| `app/procurement/vendors.tsx` | 7 | 🔴 High | High | Low |
| `app/change-management/index.tsx` | 7 | 🔴 High | Medium | Low |
| `app/procurement/index.tsx` | 4 | 🟡 Medium | High | Low |
| `hooks/useCommunication.ts` | 3 | 🔴 High | Critical | High |

### Low Priority (Defer)
- Files with 1-2 errors
- Low-traffic features
- Admin-only screens

---

## 📁 CATEGORY 1: ENUM TYPE MISMATCHES (~400 Errors)

### Description
Files use **string literals** instead of **enum values** for type-safe properties. TypeScript requires exact enum member references.

### Root Cause
```typescript
// ❌ WRONG: String literal
setStatusFilter('SENT');

// ✅ CORRECT: Enum value
setStatusFilter(PurchaseOrderStatus.SENT);
```

### Affected Files (Sample)
1. **app/procurement/index.tsx** - 4 errors
   - Status filters: `'SENT'`, `'CONFIRMED'`, `'PARTIALLY_RECEIVED'`, `'RECEIVED'`
   - Should be: `PurchaseOrderStatus.SENT`, etc.

2. **app/procurement/vendors.tsx** - 4 errors
   - Category filters: `'MATERIALS'`, `'EQUIPMENT'`, `'SUBCONTRACTOR'`, `'SERVICES'`
   - Status filters: `'ACTIVE'`, `'INACTIVE'`
   - Should be: `VendorCategory.MATERIALS`, `VendorStatus.ACTIVE`, etc.

3. **app/change-management/index.tsx** - 4 errors
   - Status filters: `'SUBMITTED'`, `'UNDER_REVIEW'`, `'APPROVED'`, `'IMPLEMENTED'`
   - Should be: `ChangeRequestStatus.SUBMITTED`, etc.

4. **app/inspection/index.tsx** - 8 errors
   - InspectionType: `'FOUNDATION'`, `'STRUCTURAL'`, `'MEP'`, etc.
   - InspectionStatus: `'SCHEDULED'`, `'IN_PROGRESS'`, `'PASSED'`, `'FAILED'`
   - Should be: `InspectionType.FOUNDATION`, `InspectionStatus.SCHEDULED`, etc.

5. **app/inspection/tests.tsx** - 8 errors
   - TestType: `'CONCRETE_STRENGTH'`, `'SOIL_COMPACTION'`, etc.
   - TestStatus: `'PENDING'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'PASSED'`, `'FAILED'`

### Fix Pattern
```typescript
// Before
const statusFilters = [
  { label: 'Sent', value: 'SENT' },
  { label: 'Confirmed', value: 'CONFIRMED' },
];
setStatusFilter('SENT');

// After
import { PurchaseOrderStatus } from '@/types/procurement';

const statusFilters = [
  { label: 'Sent', value: PurchaseOrderStatus.SENT },
  { label: 'Confirmed', value: PurchaseOrderStatus.CONFIRMED },
];
setStatusFilter(PurchaseOrderStatus.SENT);
```

### Automation Script
**File:** `scripts/fix-enum-errors.ps1`

**Strategy:**
1. Parse TypeScript files to find enum definitions
2. Map string literals to enum values in function calls
3. Safe replacement only in `setState()`, `filter()`, `===` comparisons
4. Skip string literals in JSX text content

**Usage:**
```powershell
# Test on single file
.\scripts\fix-enum-errors.ps1 -FilePath "app\procurement\index.tsx" -DryRun

# Run on all files
.\scripts\fix-enum-errors.ps1 -AllFiles

# Verify
npm run typecheck
```

### Estimated Fix Time
- **Manual:** 8-10 hours (if fixing all 400 errors individually)
- **Automated:** 2-3 hours (script development + testing + verification)
- **ROI:** 70% time savings

---

## 📁 CATEGORY 2: ICON TYPE ISSUES (~200 Errors)

### Description
Ionicons requires **literal string types** for icon names, but code uses **dynamic string returns** from functions.

### Root Cause
```typescript
// ❌ WRONG: Function returns string (not literal type)
const getIcon = (type: string) => {
  switch(type) {
    case 'MATERIALS': return 'cube-outline';
    default: return 'help-outline';
  }
};
<Ionicons name={getIcon(type)} /> // Error: Type 'string' not assignable to literal union

// ✅ CORRECT: Type assertion
<Ionicons name={getIcon(type) as any} />

// ✅ BETTER: Icon map with 'as const'
const ICON_MAP = {
  MATERIALS: 'cube-outline',
  EQUIPMENT: 'hammer-outline',
} as const;
<Ionicons name={ICON_MAP[type]} />
```

### Affected Files (Sample)
1. **app/procurement/vendors.tsx** - 2 errors
   - `getCategoryIcon()` returns string
   - `getStatusIcon()` returns string

2. **app/change-management/index.tsx** - 2 errors
   - `getCategoryIcon()` returns string
   - `getPriorityIcon()` returns string

3. **app/inspection/index.tsx** - 3 errors
   - `getTypeIcon()` returns string
   - `getStatusIcon()` returns string

### Fix Pattern

**Option 1: Type Assertion (Quick Fix)**
```typescript
// Before
<Ionicons name={getIcon(type)} size={20} />

// After
<Ionicons name={getIcon(type) as any} size={20} />
```

**Option 2: Const Map (Best Practice)**
```typescript
// Before
const getCategoryIcon = (category: VendorCategory) => {
  switch(category) {
    case VendorCategory.MATERIALS: return 'cube-outline';
    case VendorCategory.EQUIPMENT: return 'hammer-outline';
    default: return 'help-outline';
  }
};

// After
const CATEGORY_ICONS = {
  [VendorCategory.MATERIALS]: 'cube-outline',
  [VendorCategory.EQUIPMENT]: 'hammer-outline',
  [VendorCategory.SUBCONTRACTOR]: 'people-outline',
  [VendorCategory.SERVICES]: 'briefcase-outline',
} as const;

type CategoryIconName = typeof CATEGORY_ICONS[VendorCategory];

// Usage
<Ionicons name={CATEGORY_ICONS[category] || 'help-outline'} size={20} />
```

### Automation Approach
- **Pattern Detection:** Find all `<Ionicons name={function()}` patterns
- **Replace:** Add `as any` type assertion (quick fix)
- **OR:** Generate const maps for each file (better solution)

### Estimated Fix Time
- **Type Assertion:** 1-2 hours (automated script)
- **Const Maps:** 3-4 hours (semi-automated + manual verification)

---

## 📁 CATEGORY 3: MISSING HOOK PROPERTIES (~300 Errors)

### Description
Components destructure **non-existent properties** from custom hooks. Hook implementations are missing expected functions.

### Root Cause
```typescript
// ❌ WRONG: Hook doesn't export deleteDocument
const { document, loading, error, deleteDocument } = useDocument(id);
// Error: Property 'deleteDocument' does not exist

// ✅ CORRECT: Add function to hook
// hooks/useDocument.ts
export const useDocument = (id: string) => {
  // ... existing code
  
  const deleteDocument = async () => {
    await apiFetch(`/documents/${id}`, { method: 'DELETE' });
    // refresh or navigate
  };
  
  return { document, loading, error, deleteDocument };
};
```

### Affected Files (Sample)

#### 1. **app/documents/document-detail.tsx** - 1 error
**Issue:** Destructuring `deleteDocument` from `useDocument` hook

**Current Hook (hooks/useDocument.ts):**
```typescript
export const useDocument = (id: string) => {
  return { document, loading, error }; // Missing deleteDocument
};
```

**Required Fix:**
```typescript
export const useDocument = (id: string) => {
  const deleteDocument = async () => {
    await apiFetch(`/documents/${id}`, { method: 'DELETE' });
    router.back();
  };
  
  return { document, loading, error, deleteDocument };
};
```

#### 2. **hooks/useCommunication.ts** - 3 errors

**Error 1: MessageStatus enum mismatch**
```typescript
// Current (wrong)
enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

// Backend expects (correct)
enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED', 
  READ = 'READ',
}
```

**Error 2: File[] vs Attachment[] type conflict**
```typescript
// Current (wrong)
interface Message {
  attachments?: File[];
}

// Should be (correct)
interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

interface Message {
  attachments?: Attachment[];
}
```

**Error 3: ChannelSettings Partial<T> mismatch**
```typescript
// Current (wrong)
const updateSettings = (settings: Partial<ChannelSettings>) => {
  setChannel({ ...channel, settings }); // Type error
};

// Should be (correct)
const updateSettings = (settings: Partial<ChannelSettings>) => {
  setChannel({ 
    ...channel, 
    settings: { ...channel.settings, ...settings } 
  });
};
```

#### 3. **app/safety/training/index.tsx** - 1 error

**Issue:** `createdBy` type mismatch
```typescript
// Current (wrong)
interface Training {
  createdBy?: string | undefined; // Optional
}

// Component expects (correct)
interface Training {
  createdBy: string; // Required
}

// Fix: Update component to handle undefined
<Text>{training.createdBy || 'Unknown'}</Text>
```

### Fix Strategy

**Step 1: Identify Missing Functions**
```bash
# Search for destructured properties
grep -r "const {.*}" app/ hooks/ --include="*.tsx" --include="*.ts"

# Cross-reference with hook exports
grep -r "return {" hooks/ --include="*.ts"
```

**Step 2: Implement Missing Functions**
For each missing function:
1. Read API documentation for endpoint
2. Implement async function with proper error handling
3. Add to hook return object
4. Update hook type definition

**Step 3: Fix Type Mismatches**
1. Align frontend enums with backend DTOs
2. Convert File[] to Attachment[] interfaces
3. Fix Partial<T> spreads

### Estimated Fix Time
- **Per Hook:** 15-30 minutes (analysis + implementation + testing)
- **Total:** 8-10 hours for ~20 hooks

---

## 📁 CATEGORY 4: DTO PROPERTY CONFLICTS (~216 Errors)

### Description
Object literals include properties **not defined in DTO types**, or required properties are **missing**.

### Root Cause
```typescript
// ❌ WRONG: 'total' not in CreateMaterialOrderRequest
const orderData: CreateMaterialOrderRequest = {
  projectId: 1,
  items: [...],
  total: 15000, // Error: Property 'total' does not exist
};

// ✅ CORRECT: Remove extra property or add to DTO
const orderData: CreateMaterialOrderRequest = {
  projectId: 1,
  items: [...],
  // total calculated on backend
};
```

### Affected Files (Sample)

#### 1. **app/inventory/create-order.tsx** - 1 error

**Issue:** `total` property doesn't exist in DTO

**Current Code:**
```typescript
const orderData: CreateMaterialOrderRequest = {
  projectId: Number(projectId),
  materialId: selectedMaterial.id,
  quantity,
  total: selectedMaterial.price * quantity, // ❌ Error
  deliveryDate: deliveryDate.toISOString(),
};
```

**Fix Options:**

**Option A: Remove total (backend calculates)**
```typescript
const orderData: CreateMaterialOrderRequest = {
  projectId: Number(projectId),
  materialId: selectedMaterial.id,
  quantity,
  deliveryDate: deliveryDate.toISOString(),
};
```

**Option B: Update DTO to include total**
```typescript
// types/inventory.ts
export interface CreateMaterialOrderRequest {
  projectId: number;
  materialId: string;
  quantity: number;
  deliveryDate: string;
  total?: number; // Add optional total
}
```

#### 2. **Backend DTO Verification Required**

Many errors stem from **frontend/backend DTO mismatches**. Need to verify backend schema:

```bash
# SSH to backend and check DTOs
ssh root@103.200.20.100 "cat /root/baotienweb-api/src/*/dto/*.dto.ts"
```

**Common Mismatches:**
- Frontend has extra properties backend doesn't accept
- Frontend missing required properties backend needs
- Type differences (string vs number, Date vs ISO string)

### Fix Strategy

**Step 1: Audit Backend DTOs**
```bash
# Get all DTO definitions
find backend-nestjs/src -name "*.dto.ts" -exec cat {} \;
```

**Step 2: Sync Frontend Types**
```typescript
// For each DTO mismatch:
// 1. Compare frontend types/ with backend dto/
// 2. Update frontend to match backend
// 3. Or update backend if frontend is correct
```

**Step 3: Validate API Calls**
```typescript
// Add runtime validation
import { z } from 'zod';

const CreateOrderSchema = z.object({
  projectId: z.number(),
  materialId: z.string(),
  quantity: z.number().positive(),
  deliveryDate: z.string().datetime(),
});

// Before API call
const validated = CreateOrderSchema.parse(orderData);
await apiFetch('/orders', { method: 'POST', body: validated });
```

### Estimated Fix Time
- **Backend Audit:** 2 hours (document all DTOs)
- **Frontend Sync:** 3-4 hours (update types, fix calls)
- **Validation:** 1 hour (add Zod schemas)
- **Total:** 4-5 hours

---

## 🛠️ FIX PATTERNS & SOLUTIONS

### Pattern 1: Enum Import & Usage
```typescript
// Step 1: Import enum at top of file
import { PurchaseOrderStatus } from '@/types/procurement';

// Step 2: Use in filter arrays
const statusFilters = [
  { label: 'Sent', value: PurchaseOrderStatus.SENT },
  { label: 'Confirmed', value: PurchaseOrderStatus.CONFIRMED },
];

// Step 3: Use in state updates
setStatusFilter(PurchaseOrderStatus.SENT);

// Step 4: Use in comparisons
if (order.status === PurchaseOrderStatus.CONFIRMED) {
  // ...
}
```

### Pattern 2: Icon Type Safety
```typescript
// Step 1: Create icon map with 'as const'
const STATUS_ICONS = {
  [InspectionStatus.SCHEDULED]: 'calendar-outline',
  [InspectionStatus.IN_PROGRESS]: 'play-circle-outline',
  [InspectionStatus.PASSED]: 'checkmark-circle-outline',
  [InspectionStatus.FAILED]: 'close-circle-outline',
} as const;

// Step 2: Use with fallback
<Ionicons 
  name={STATUS_ICONS[status] || 'help-outline'} 
  size={24} 
/>
```

### Pattern 3: Hook Function Addition
```typescript
// Step 1: Define function in hook
export const useDocument = (id: string) => {
  // ... existing state
  
  const deleteDocument = async () => {
    try {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' });
      router.back();
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  };
  
  // Step 2: Add to return
  return { 
    document, 
    loading, 
    error, 
    deleteDocument 
  };
};

// Step 3: Update hook type
export interface UseDocumentReturn {
  document: Document | null;
  loading: boolean;
  error: Error | null;
  deleteDocument: () => Promise<void>;
}
```

### Pattern 4: DTO Alignment
```typescript
// Step 1: Check backend DTO
// backend: CreateOrderDto { projectId: number, items: OrderItem[] }

// Step 2: Match frontend type
export interface CreateMaterialOrderRequest {
  projectId: number;
  items: Array<{
    materialId: string;
    quantity: number;
  }>;
  // Remove properties not in backend DTO
}

// Step 3: Update API call
const orderData: CreateMaterialOrderRequest = {
  projectId: Number(projectId),
  items: [{ materialId: material.id, quantity }],
};
await createMaterialOrder(orderData);
```

---

## 📋 FILE-BY-FILE BREAKDOWN

### High Priority Files (14+ Errors)

#### `app/inspection/index.tsx` - 14 errors

**Errors:**
1. InspectionType enum values (8 errors)
   - Using: `'FOUNDATION'`, `'STRUCTURAL'`, `'MEP'`, `'ELECTRICAL'`, `'PLUMBING'`, `'HVAC'`, `'FIRE_SAFETY'`, `'FINAL'`
   - Should use: `InspectionType.FOUNDATION`, etc.

2. InspectionStatus enum values (4 errors)
   - Using: `'SCHEDULED'`, `'IN_PROGRESS'`, `'PASSED'`, `'FAILED'`
   - Should use: `InspectionStatus.SCHEDULED`, etc.

3. STATUS_COLORS record incomplete (2 errors)
   - Missing: `CONDITIONAL_PASS` color

**Fix Time:** 20 minutes

**Script Compatible:** ✅ Yes (enum replacements)

---

#### `app/inspection/tests.tsx` - 12 errors

**Errors:**
1. TestType enum values (6 errors)
   - Using: `'CONCRETE_STRENGTH'`, `'SOIL_COMPACTION'`, `'STEEL_QUALITY'`, `'WATERPROOFING'`, `'LOAD_TEST'`, `'OTHER'`
   - Should use: `TestType.CONCRETE_STRENGTH`, etc.

2. TestStatus enum values (6 errors)
   - Using: `'PENDING'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'PASSED'`, `'FAILED'`, `'CANCELLED'`
   - Should use: `TestStatus.PENDING`, etc.

**Fix Time:** 20 minutes

**Script Compatible:** ✅ Yes (enum replacements)

---

### Medium Priority Files (4-10 Errors)

#### `app/procurement/vendors.tsx` - 7 errors

**Errors:**
1. VendorCategory filters (4 errors)
2. VendorStatus filters (2 errors)
3. getCategoryIcon() type (1 error)

**Fix Time:** 15 minutes

---

#### `app/change-management/index.tsx` - 7 errors

**Errors:**
1. ChangeRequestStatus filters (4 errors)
2. getCategoryIcon() type (2 errors)
3. getPriorityIcon() type (1 error)

**Fix Time:** 15 minutes

---

#### `app/procurement/index.tsx` - 4 errors

**Errors:**
1. PurchaseOrderStatus filters (4 errors)

**Fix Time:** 10 minutes

**Script Compatible:** ✅ Yes

---

### Low Priority Files (1-3 Errors)

#### `hooks/useCommunication.ts` - 3 errors

**Errors:**
1. MessageStatus enum values (1 error)
2. File[] vs Attachment[] (1 error)
3. ChannelSettings Partial<T> (1 error)

**Fix Time:** 30 minutes

**Script Compatible:** ⚠️ Partial (manual verification needed)

---

#### `app/documents/document-detail.tsx` - 1 error

**Error:** Missing `deleteDocument` in useDocument hook

**Fix Time:** 15 minutes

**Script Compatible:** ❌ No (requires hook implementation)

---

#### `app/safety/training/index.tsx` - 1 error

**Error:** createdBy type mismatch (string | undefined vs string)

**Fix Time:** 5 minutes

**Script Compatible:** ✅ Yes (add optional chaining)

---

## 🤖 AUTOMATION SCRIPT SPECIFICATION

### Script: `scripts/fix-enum-errors.ps1`

```powershell
<#
.SYNOPSIS
Automatically fix TypeScript enum type errors in BaoTienWeb project.

.DESCRIPTION
This script scans TypeScript/TSX files for string literals that should be enum values,
and replaces them with proper enum references.

.PARAMETER FilePath
Single file to fix (for testing)

.PARAMETER AllFiles
Process all files with known enum errors

.PARAMETER DryRun
Show changes without applying them

.EXAMPLE
.\scripts\fix-enum-errors.ps1 -FilePath "app\procurement\index.tsx" -DryRun

.EXAMPLE
.\scripts\fix-enum-errors.ps1 -AllFiles
#>

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
        'CANCELLED' = 'TestStatus.CANCELLED'
    }
}

# Import statements to add
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
    
    Write-Host "Processing: $file" -ForegroundColor Cyan
    
    $content = Get-Content $file -Raw
    $originalContent = $content
    $changes = 0
    $importsToAdd = @()
    
    foreach ($enumName in $enumMappings.Keys) {
        $enumValues = $enumMappings[$enumName]
        
        foreach ($stringValue in $enumValues.Keys) {
            $enumValue = $enumValues[$stringValue]
            
            # Pattern 1: In filter arrays { value: 'STRING' }
            $pattern1 = "value:\s*['\"]$stringValue['\"]"
            $replacement1 = "value: $enumValue"
            if ($content -match $pattern1) {
                $content = $content -replace $pattern1, $replacement1
                $changes++
                if ($importsToAdd -notcontains $enumName) {
                    $importsToAdd += $enumName
                }
            }
            
            # Pattern 2: In function calls setState('STRING')
            $pattern2 = "\((.*?)['\"]$stringValue['\"](.*?)\)"
            if ($content -match "set\w+Filter\s*\(['\"]$stringValue['\"]\)") {
                $content = $content -replace "set(\w+)Filter\s*\(['\"]$stringValue['\"]\)", "set`$1Filter($enumValue)"
                $changes++
                if ($importsToAdd -notcontains $enumName) {
                    $importsToAdd += $enumName
                }
            }
            
            # Pattern 3: In comparisons === 'STRING'
            $pattern3 = "===\s*['\"]$stringValue['\"]"
            $replacement3 = "=== $enumValue"
            if ($content -match $pattern3) {
                $content = $content -replace $pattern3, $replacement3
                $changes++
                if ($importsToAdd -notcontains $enumName) {
                    $importsToAdd += $enumName
                }
            }
        }
    }
    
    # Add missing imports
    if ($importsToAdd.Count -gt 0) {
        foreach ($enumName in $importsToAdd) {
            $importStatement = $enumImports[$enumName]
            if ($content -notmatch [regex]::Escape($importStatement)) {
                # Find last import line
                $lines = $content -split "`n"
                $lastImportIndex = -1
                for ($i = 0; $i -lt $lines.Count; $i++) {
                    if ($lines[$i] -match "^import ") {
                        $lastImportIndex = $i
                    }
                }
                
                if ($lastImportIndex -ge 0) {
                    $lines = @($lines[0..$lastImportIndex]) + $importStatement + @($lines[($lastImportIndex+1)..($lines.Count-1)])
                    $content = $lines -join "`n"
                    $changes++
                }
            }
        }
    }
    
    if ($changes -gt 0) {
        Write-Host "  ✅ Made $changes changes" -ForegroundColor Green
        
        if (-not $DryRun) {
            Set-Content -Path $file -Value $content -Encoding UTF8
            Write-Host "  💾 File updated" -ForegroundColor Green
        } else {
            Write-Host "  🔍 DRY RUN - No changes written" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ℹ️  No changes needed" -ForegroundColor Gray
    }
    
    return $changes
}

# Main execution
$targetFiles = @()

if ($FilePath) {
    $targetFiles = @($FilePath)
} elseif ($AllFiles) {
    $targetFiles = @(
        "app\procurement\index.tsx",
        "app\procurement\vendors.tsx",
        "app\change-management\index.tsx",
        "app\inspection\index.tsx",
        "app\inspection\tests.tsx",
        "app\safety\training\index.tsx"
    )
} else {
    Write-Host "❌ Error: Specify -FilePath or -AllFiles" -ForegroundColor Red
    exit 1
}

$totalChanges = 0
foreach ($file in $targetFiles) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    if (Test-Path $fullPath) {
        $totalChanges += Fix-EnumErrors -file $fullPath
    } else {
        Write-Host "⚠️  File not found: $fullPath" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Files processed: $($targetFiles.Count)" -ForegroundColor White
Write-Host "  Total changes: $totalChanges" -ForegroundColor White

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN - Run without -DryRun to apply changes" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Run 'npm run typecheck' to verify fixes" -ForegroundColor Green
}
```

### Usage Instructions

1. **Test on single file:**
   ```powershell
   .\scripts\fix-enum-errors.ps1 -FilePath "app\procurement\index.tsx" -DryRun
   ```

2. **Review changes:**
   ```powershell
   git diff app\procurement\index.tsx
   ```

3. **Apply to all files:**
   ```powershell
   .\scripts\fix-enum-errors.ps1 -AllFiles
   ```

4. **Verify:**
   ```powershell
   npm run typecheck
   ```

---

## 📈 PROGRESS TRACKING

### Week 1: Critical Fixes (Top 50 Errors)
- [ ] Day 1: Fix inspection screens (26 errors)
- [ ] Day 2: Fix procurement screens (11 errors)
- [ ] Day 3: Fix change-management (7 errors)
- [ ] Day 4: Fix communication hooks (3 errors)
- [ ] Day 5: Fix remaining critical (3 errors)

### Week 2: Automation & Bulk Fixes
- [ ] Day 1: Develop and test enum fix script
- [ ] Day 2: Run script on all enum errors (~400 fixes)
- [ ] Day 3: Fix icon type issues (~200 fixes)
- [ ] Day 4: Verification and testing
- [ ] Day 5: Documentation update

### Week 3: Hook & DTO Fixes
- [ ] Day 1-2: Audit and fix missing hook functions
- [ ] Day 3-4: Backend DTO verification and frontend sync
- [ ] Day 5: Final verification and testing

### Success Criteria
- ✅ All 1,116 errors resolved
- ✅ `npm run typecheck` passes with 0 errors
- ✅ All screens tested manually
- ✅ CI/CD pipeline green
- ✅ Production deployment ready

---

## 🎯 QUICK WIN OPPORTUNITIES

### Immediate Fixes (< 1 Hour)
1. **Run enum fix script** → ~400 errors fixed automatically
2. **Add type assertions to icons** → ~100 errors fixed quickly
3. **Fix simple DTO mismatches** → ~20 errors fixed

### High ROI Fixes (Best Time Investment)
1. **Enum automation script** → 70% time savings
2. **Icon const maps** → Improves type safety + fixes ~200 errors
3. **Hook function additions** → Enables feature completeness

### Deferred (Can Wait)
- Low-traffic screen errors
- Admin-only features
- Non-critical type safety issues

---

## 💡 PREVENTION STRATEGIES

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run typecheck"
    }
  }
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
- name: TypeScript Check
  run: npm run typecheck
  
- name: Fail on errors
  if: failure()
  run: exit 1
```

### Development Guidelines
1. **Always import enums** → Don't use string literals
2. **Define icon maps** → Don't use dynamic strings
3. **Match backend DTOs** → Keep types in sync
4. **Complete hook contracts** → Export all expected functions

### Code Review Checklist
- [ ] No string literals where enums expected
- [ ] No dynamic icon names without type assertion
- [ ] DTOs match backend schema
- [ ] Hooks export all destructured properties

---

## 📞 SUPPORT & RESOURCES

### Documentation
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Ionicons Types:** https://ionic.io/ionicons
- **Enum Best Practices:** [TypeScript Enums Guide]

### Tools
- **TypeScript Compiler:** `npm run typecheck`
- **ESLint:** `npm run lint`
- **VS Code:** TypeScript IntelliSense

### Team Contacts
- **Lead Developer:** Technical decisions on DTO changes
- **Backend Team:** DTO schema verification
- **QA Team:** Testing after bulk fixes

---

## 📊 FINAL STATISTICS

### Current State
- ✅ **Timeline Feature:** 0 errors (6 files)
- ✅ **Payment Feature:** 0 errors (6 files)
- ❌ **Legacy Codebase:** 1,116 errors (50+ files)

### Target State
- ✅ **All Features:** 0 errors
- ✅ **Production Ready:** Deployable
- ✅ **Type Safety:** 100% coverage

### Estimated Total Fix Time
- **Automated fixes (enum + icons):** 4-5 hours
- **Manual fixes (hooks + DTOs):** 12-15 hours
- **Testing & verification:** 3-4 hours
- **Total:** ~20-24 hours (3 working days)

---

**📅 Report Generated:** December 6, 2025  
**🔄 Next Update:** After Week 1 critical fixes  
**✅ Status:** Ready for implementation

---

**LET'S FIX ALL 1,116 ERRORS AND SHIP TO PRODUCTION! 🚀**
