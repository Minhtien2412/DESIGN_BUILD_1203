# CRM Integration Testing Guide

## ✅ Integration Status: READY

### Components Verified
- ✅ Configuration (env.ts)
- ✅ DataSync Service
- ✅ useDataSync Hook  
- ✅ CRMDataList Component
- ✅ SyncStatusBadge Component
- ✅ Test Screen Created
- ✅ CRM API Live & Working

### How to Test

#### 1. Start Development Server
```bash
npm start
```

#### 2. Access Test Screen

**Option A: Direct Navigation (in app)**
```typescript
import { router } from 'expo-router';
router.push('/(tabs)/test-crm');
```

**Option B: Add Quick Access Button**
Add this to your profile or menu screen:
```tsx
<TouchableOpacity onPress={() => router.push('/(tabs)/test-crm')}>
  <Text>Test CRM Sync</Text>
</TouchableOpacity>
```

**Option C: Development Menu**
1. Open app
2. Press `m` in terminal to open developer menu
3. Navigate to `/(tabs)/test-crm`

#### 3. Test Flow
1. **Login** - Login with your account first
2. **Check Status** - View sync status badge
3. **Manual Sync** - Click "Manual Sync" button
4. **View Data** - Scroll to see Projects, Invoices, Estimates, Tickets
5. **Clear Data** - Test clearing sync data
6. **Re-sync** - Sync again to verify persistence

### Test Scenarios

#### Scenario 1: First Time Sync
1. Fresh login
2. No CRM data yet
3. Click "Manual Sync"
4. Should fetch and display CRM data

#### Scenario 2: Cached Data
1. Already synced before
2. Open test screen
3. Data should load from cache
4. Badge shows last sync time

#### Scenario 3: Force Refresh
1. Click "Manual Sync" again
2. Should re-fetch from API
3. Update last sync timestamp

#### Scenario 4: Error Handling
1. Turn off internet
2. Try to sync
3. Should show error message
4. Turn on internet and retry

### Expected Results

**Sync Status Card:**
```
CRM Linked: ✅ Yes
Last Sync: 2026-01-06 10:30:45
Data Version: v1.0
```

**Data Sections:**
- Projects (up to 5)
- Invoices (up to 5)  
- Estimates (up to 5)
- Tickets (up to 5)

Each item shows:
- Status indicator (colored dot)
- Primary info (name/number)
- Metadata (dates, amounts)

### Troubleshooting

**Issue: "CRM not linked"**
- Click "Manual Sync"
- Check internet connection
- Verify API token in env.ts

**Issue: "Failed to fetch"**
- Check CRM URL is correct
- Verify API token is valid
- Test API with: `.\test-crm-api.ps1`

**Issue: No data showing**
- Check CRM has data (customers, projects, etc.)
- Run: `.\test-crm-api.ps1` to verify
- Check browser console for errors

**Issue: TypeScript errors**
- Run: `npx tsc --noEmit`
- Fix any type mismatches
- Restart Metro bundler

### API Endpoints Tested

All working ✅:
- GET /api/customers
- GET /api/projects
- GET /api/invoices
- GET /api/estimates
- GET /api/tickets
- GET /api/tasks
- GET /api/staff

### Next Steps

1. **Test on Device**
   - Build and test on real device
   - Verify offline caching works
   - Test sync performance

2. **Add to Main App**
   - Integrate CRMDataList into dashboard
   - Add sync indicators to relevant screens
   - Show CRM status in profile

3. **Enhancements**
   - Real-time sync (webhooks)
   - Create/update CRM items
   - Conflict resolution
   - Sync scheduling

### Files Created

```
app/(tabs)/test-crm.tsx           - Test screen UI
test-crm-api.ps1                  - API test script
test-crm-integration.ps1          - E2E test script
CRM_API_TEST_RESULTS.md          - API test report
CRM_INTEGRATION_TESTING_GUIDE.md - This file
```

### Quick Commands

```bash
# Test CRM API
.\test-crm-api.ps1

# Test full integration
.\test-crm-integration.ps1

# Start app
npm start

# Build APK (for device testing)
npm run build:apk
```

---

**Status:** ✅ Ready for testing  
**Last Updated:** January 6, 2026  
**Next:** Test on real device or emulator
