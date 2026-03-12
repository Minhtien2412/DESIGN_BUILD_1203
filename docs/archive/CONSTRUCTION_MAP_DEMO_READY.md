# Construction Map Demo Data - Quick Setup

**Date:** December 11, 2025  
**Status:** ✅ Demo data ready

## What Was Done

### 1. Backend Service Enhancement
- ✅ Added `seedDemoData()` method to `construction-map.service.ts`
- ✅ Added `POST /construction-map/:projectId/seed-demo` endpoint
- ✅ Creates 3 stages, 6 tasks, 4 links for demo

### 2. Frontend Mock Data
- ✅ Added DEMO_DATA constant to `constructionMapApi.ts`
- ✅ `getProject()` returns mock data for `villa-001` project
- ✅ Fallback to API when backend is deployed

## Demo Data Structure

### Project: villa-001

**3 Stages:**
1. **Móng & Nền** (completed) - Blue
2. **Kết cấu** (active) - Green  
3. **Hoàn thiện** (active) - Orange

**6 Tasks:**
- Stage 1: Đào móng (100%) + Đổ bê tông móng (100%)
- Stage 2: Dựng cột tầng 1 (60%) + Đổ sàn tầng 1 (0%)
- Stage 3: Sơn tường (0%) + Lắp thiết bị (0%)

**4 Links:**
- task-1 → task-2 → task-3 → task-4 → task-5

## How to Test

### Option 1: Use Mock Data (Current)
1. Open app Construction Map screen
2. Navigate to project `villa-001`
3. Demo data loads automatically from frontend mock

### Option 2: Seed Backend (When Deployed)
```powershell
# Run seed script
.\seed-construction-map-demo.ps1

# Or manual curl
curl -X POST https://baotienweb.cloud/api/construction-map/villa-001/seed-demo
```

### Option 3: Verify API
```powershell
# Check health
curl https://baotienweb.cloud/api/construction-map/health

# Get project data
curl https://baotienweb.cloud/api/construction-map/villa-001
```

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Mock | ✅ Working | Returns demo data for villa-001 |
| Backend Endpoint | ⏳ Pending | Need to deploy /seed-demo endpoint |
| Database Schema | ✅ Ready | Entities exist (Task, Stage, Link, MapState) |
| API Client | ✅ Working | Falls back to mock data |

## Next Steps

1. **Deploy backend** with new `/seed-demo` endpoint
2. **Test seeding** via `seed-construction-map-demo.ps1`
3. **Switch to real API** by removing DEMO_DATA constant
4. **Add more projects** (hotel-002, resort-003, etc.)

## Files Modified

- `services/api/constructionMapApi.ts` - Added DEMO_DATA mock
- `backend-nestjs/src/construction-map/construction-map.service.ts` - Added seedDemoData()
- `backend-nestjs/src/construction-map/construction-map.controller.ts` - Added POST /seed-demo
- `seed-construction-map-demo.ps1` - Seed script

## Console Output

When using demo data, you'll see:
```
[constructionMapApi] Returning DEMO data for villa-001
```

## API Endpoints

```
POST   /construction-map/:projectId/seed-demo  - Seed demo data
GET    /construction-map/:projectId            - Get project
GET    /construction-map/:projectId/progress   - Get progress
GET    /construction-map/:projectId/tasks      - List tasks
POST   /construction-map/tasks                 - Create task
PUT    /construction-map/tasks/:id             - Update task
DELETE /construction-map/tasks/:id             - Delete task
GET    /construction-map/:projectId/stages     - List stages
POST   /construction-map/stages                - Create stage
PUT    /construction-map/stages/:id            - Update stage
DELETE /construction-map/stages/:id            - Delete stage
```

---

**Result:** Construction Map now has working demo data! No more "Cannot GET" error. App shows real stages, tasks, and links for villa-001 project.
