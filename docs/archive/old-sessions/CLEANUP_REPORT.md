# Cleanup & Restructure Report
**Date**: December 4, 2025
**Status**: 🔧 In Progress

## Summary
Fixing 1893 TypeScript errors and restructuring project for maintainability.

## Actions Completed ✅

### 1. Directory Restructure
- ✅ Created `/docs-archive` and moved 240+ markdown files from root
- ✅ Created `/backend-archive` for backend-implementation/ and backend-reference/
- ✅ Root directory now clean with only README.md

### 2. Type System Unification
- ✅ Created `/types/core.ts` as single source of truth
- ✅ **User interface**: Unified User.id as `number` (was string in some places)
- ✅ **Project interface**: Added ProjectProgress with required progress field
- ✅ **API types**: Centralized ApiResponse, PaginatedResponse, ListResponse
- ✅ Updated `services/userApi.ts` to import from @/types/core
- ✅ Updated `context/AuthContext.tsx` to re-export User from core

### 3. Files Fixed
| File | Issue | Solution |
|------|-------|----------|
| `types/core.ts` | N/A - New file | Central type definitions (320 lines) |
| `services/userApi.ts` | User.id: string | Changed to number, import from core |
| `context/AuthContext.tsx` | Duplicate User def | Import & re-export from core |
| `app/profile/edit.tsx` | Type mismatch | updateAuthUser now compatible |

## In Progress 🔧

### 4. QC/QA Checklist Errors (150+ errors)
**Files affected**:
- `app/projects/[id]/qc-qa/checklist/structure.tsx`
- `app/projects/[id]/qc-qa/checklist/mep.tsx`
- `types/inspection.ts`

**Issues**:
1. ❌ ChecklistItem missing `checklistId` property (required)
2. ❌ InspectionStatus enum mismatch: 
   - Code uses: 'PASS', 'FAIL', 'NA', 'PENDING'
   - Type expects: Different values
3. ❌ Photo upload type: expecting string, receiving object

**Solution Plan**:
```typescript
// types/inspection.ts - Add missing field
export interface ChecklistItem {
  id: string;
  checklistId: string; // ← ADD THIS
  description: string;
  // ... rest
  result?: InspectionStatus; // ← Fix enum
}

// Fix InspectionStatus enum
export type InspectionStatus = 
  | 'PENDING'
  | 'PASS'
  | 'FAIL'
  | 'NA'
  | 'IN_PROGRESS'
  | 'COMPLETED';
```

### 5. Dashboard Errors (10+ errors)
**File**: `app/dashboard/client.tsx`

**Issues**:
1. ❌ Project type conflicts (progress?: number vs progress: number)
2. ❌ Missing style properties (projectCard, projectName, etc.)
3. ❌ formatTime() expecting string, receiving undefined

**Solution**: Use ProjectProgress type from core, add missing styles

## Remaining Work ⏳

### 6. Product Moderation Error
**File**: `hooks/useProducts.ts`
- Issue: moderateProduct() type mismatch
- Fix: Update ModerateProductDto type

### 7. Other Files with Errors
- ~1700 remaining errors (mostly type conflicts)
- Need systematic review of each error category

## Statistics 📊

### Before Cleanup
- Root directory: 241 markdown files
- TypeScript errors: 1893
- Duplicate User interfaces: 41
- Backend folders: 3 (implementation, reference, docs/backend-code)

### After Cleanup (Target)
- Root directory: 1 markdown (README.md)
- TypeScript errors: 0
- User interfaces: 1 (in /types/core.ts)
- Backend folders: 0 (moved to /backend-archive)

### Progress
- Files moved to archive: 240+
- New core types file: 1
- Files fixed: 4
- Errors fixed: ~50
- **Remaining errors**: ~1843

## Next Steps

1. ⏭️ Fix ChecklistItem type (add checklistId, fix InspectionStatus)
2. ⏭️ Fix Dashboard client errors (Project types, styles)
3. ⏭️ Fix useProducts moderation type
4. ⏭️ Run `npx tsc --noEmit` to find remaining errors
5. ⏭️ Categorize remaining 1700+ errors by type
6. ⏭️ Create fix scripts for common patterns
7. ⏭️ Final verification and testing

## Commands Run

```powershell
# Move markdown files to archive
Get-ChildItem -Filter "*.md" | Where { $_.Name -ne "README.md" } | Move-Item -Destination "docs-archive/"

# Create clean userApi.ts
Remove-Item userApi.ts; Move-Item userApi.clean.ts userApi.ts
```

## Files Created
1. `/types/core.ts` - 320 lines (User, Project, API types)
2. `/services/userApi.ts` - Cleaned, 240 lines
3. `/docs-archive/` - Directory
4. `/backend-archive/` - Directory
5. `CLEANUP_REPORT.md` - This file

---
**Status**: 🔧 Actively fixing type system
**Next**: Fix QC/QA checklist types then dashboard
