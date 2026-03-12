# Offline Mode Implementation

## Overview

Comprehensive offline mode support with network status detection, persistent data storage, and graceful degradation when network is unavailable.

## Architecture

### 1. Network Status Detection
- **Hook**: `useNetworkStatus`
- **Package**: `@react-native-community/netinfo`
- **Features**:
  - Real-time network connectivity monitoring
  - Internet reachability detection
  - Network type detection (WiFi, Cellular, etc.)
  - Offline state calculation

### 2. Offline Storage Layer
- **Utility**: `utils/offlineStorage.ts`
- **Storage**: AsyncStorage (cross-platform)
- **Features**:
  - TTL-based data expiration (default 24 hours)
  - Automatic cleanup of expired data
  - Type-safe generic storage
  - Storage statistics

### 3. Offline Indicator UI
- **Component**: `components/ui/OfflineIndicator.tsx`
- **Features**:
  - Animated slide-down banner
  - Shows when device is offline
  - Auto-hides when back online
  - Platform-specific positioning (iOS status bar)

## Data Flow

### Online Mode (Normal Operation)
```
User Request
  ↓
Check In-Memory Cache (0ms)
  ↓ cache miss
API Request (1000ms+)
  ↓ success
├─ Update In-Memory Cache (5min TTL)
├─ Save to Offline Storage (24hr TTL)
└─ Display to User
```

### Offline Mode (No Network)
```
User Request
  ↓
Detect Offline State
  ↓
Check In-Memory Cache (0ms)
  ↓ cache miss
Load from Offline Storage
  ↓ found
Display Cached Data to User
  ↓ not found
Show "No offline data" Error
```

### Reconnection Flow
```
Network Comes Back Online
  ↓
Background API Refresh
  ↓
Update In-Memory Cache
  ↓
Update Offline Storage
  ↓
Auto-Update UI
```

## Implementation Details

### useNetworkStatus Hook

**Location**: `hooks/useNetworkStatus.ts`

```typescript
const { isOffline, isConnected, isInternetReachable, type } = useNetworkStatus();

// States:
// - isOffline: true when no connection or internet unreachable
// - isConnected: device has network connection
// - isInternetReachable: can reach the internet (may be null initially)
// - type: 'wifi' | 'cellular' | 'ethernet' | etc.
```

**Features**:
- Subscribes to NetInfo state changes
- Provides unified offline detection
- Console logs state changes for debugging

### Offline Storage Utilities

**Location**: `utils/offlineStorage.ts`

#### Save Data
```typescript
await saveOfflineData('services_offline', servicesData, 24 * 60 * 60 * 1000);
// TTL defaults to 24 hours
```

#### Retrieve Data
```typescript
const data = await getOfflineData<Service[]>('services_offline');
// Returns null if not found or expired
```

#### Remove Data
```typescript
await removeOfflineData('services_offline');
```

#### Clear All
```typescript
await clearAllOfflineData();
```

#### Get Stats
```typescript
const stats = await getOfflineStorageStats();
// { count: 3, keys: ['services_offline', 'projects_offline', ...] }
```

**Data Structure**:
```typescript
interface OfflineData<T> {
  data: T;           // The actual data
  timestamp: number; // When it was saved
  expiresAt: number; // When it expires
}
```

### Enhanced Hooks with Offline Support

#### useServices Hook

**Offline Strategy**:
1. Check if device is offline
2. If offline → load from offline storage
3. If online → check cache → fetch API
4. Always persist successful API response for offline access

**Code Flow**:
```typescript
const { services, loading, error } = useServices();

// Automatically:
// - Returns cached data instantly (0ms)
// - Falls back to offline storage when offline
// - Shows friendly error if no offline data available
// - Persists fresh data after each successful fetch
```

#### useProjects Hook

**Offline Strategy**: Same as useServices
- Maps backend projects to UI format before caching
- Persists mapped data (not raw backend data)
- 24-hour TTL for offline storage

#### useNotifications Hook

**Offline Strategy**: Same as useServices
- Shorter cache TTL (1 minute)
- Still persists to offline storage (24 hours)
- Important for viewing past notifications offline

## Offline Keys

| Hook | Cache Key | Offline Key | Cache TTL | Offline TTL |
|------|-----------|-------------|-----------|-------------|
| Services | `services:all` | `services_offline` | 5 min | 24 hrs |
| Projects | `projects:all` | `projects_offline` | 5 min | 24 hrs |
| Notifications | `notifications:all` | `notifications_offline` | 1 min | 24 hrs |

## Error Handling

### Offline Error Messages
When offline with no cached data:
```
"No offline data available. Please connect to the internet."
```

**UX Benefits**:
- Clear, actionable message
- User understands why content is unavailable
- Knows exactly what to do (connect to internet)

### Mutation Handling (Future)
Currently, mutations (create, update, delete) require network connection.

**Future Enhancement**: Offline queue
- Queue mutations when offline
- Sync when back online
- Handle conflicts gracefully

## UI Components

### OfflineIndicator

**Location**: `components/ui/OfflineIndicator.tsx`

**Behavior**:
- Slides down from top when offline
- Slides up when back online
- Red background with white text
- Icon + "No Internet Connection"

**Platform Adjustments**:
- iOS: Top offset 44px (status bar height)
- Android: Top offset 0px
- Web: Fixed positioning

**Animation**:
- Spring animation for smooth feel
- Tension: 65, Friction: 10
- Uses native driver for performance

## Testing Offline Mode

### Manual Testing

#### 1. Test Offline Data Persistence
```bash
1. Open app while online
2. Navigate to Services/Projects/Notifications
3. Wait for data to load
4. Enable Airplane Mode
5. Navigate away and back
6. Data should load instantly from offline storage
```

#### 2. Test Offline Indicator
```bash
1. Open app
2. Enable Airplane Mode
3. Red banner should slide down
4. Disable Airplane Mode
5. Banner should slide up
```

#### 3. Test No Offline Data
```bash
1. Clear app data
2. Enable Airplane Mode
3. Open app and navigate to Services
4. Should show "No offline data available" error
```

### Automated Testing
```typescript
// Check offline storage stats
import { getOfflineStorageStats } from '@/utils/offlineStorage';

const stats = await getOfflineStorageStats();
console.log('Offline items:', stats.count);
console.log('Offline keys:', stats.keys);
```

## Performance Impact

### Before Offline Mode
- **Online**: API call every navigation (1000ms+)
- **Offline**: Complete failure

### After Offline Mode
- **Online**: Instant cache hit → background refresh
- **Offline**: Load from AsyncStorage (~10ms)

### Storage Impact
- **In-Memory Cache**: ~1-5 MB (cleared on app restart)
- **Offline Storage**: ~1-10 MB (persists across restarts)
- **TTL Cleanup**: Automatic expiration after 24 hours

## Configuration

### Adjust Offline TTL
```typescript
// In hooks/useServices.ts, useProjects.ts, useNotifications.ts
const OFFLINE_TTL = 48 * 60 * 60 * 1000; // 48 hours instead of 24
await saveOfflineData(OFFLINE_KEY, data, OFFLINE_TTL);
```

### Disable Offline Storage
```typescript
// Comment out saveOfflineData calls
// await saveOfflineData(OFFLINE_KEY, data);
```

### Clear Offline Data on Logout
```typescript
// In AuthContext signOut()
import { clearAllOfflineData } from '@/utils/offlineStorage';

async function signOut() {
  await clearAllOfflineData(); // Clear offline cache
  // ... rest of signOut logic
}
```

## Security Considerations

### Data Sensitivity
- Offline data stored in AsyncStorage (unencrypted)
- **Recommendation**: Don't cache sensitive PII offline
- Services, Projects, Notifications: Low-sensitivity OK

### Future: Encrypted Offline Storage
```typescript
// Use expo-secure-store for sensitive data
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('offline_sensitive', 
  JSON.stringify(encryptedData)
);
```

## Future Enhancements

### 1. Offline Mutation Queue
- Queue create/update/delete when offline
- Sync when back online
- Optimistic UI updates
- Conflict resolution

### 2. Partial Sync
- Only sync changed data
- Delta updates instead of full fetch
- Reduce bandwidth usage

### 3. Offline-First Architecture
- All data available offline by default
- Background sync when online
- Service workers (web)
- Background fetch (mobile)

### 4. Offline Analytics
- Track offline usage patterns
- Measure offline feature adoption
- Optimize offline storage strategy

### 5. Smart Prefetching
- Predict user needs
- Preload likely-needed data
- Machine learning recommendations

## Summary

✅ **Implemented Features**:
- Network status detection with `useNetworkStatus`
- Persistent offline storage with 24hr TTL
- Offline indicator UI component
- Enhanced hooks (Services, Projects, Notifications)
- Automatic data persistence after successful fetches
- Graceful fallback when offline
- Clear error messages

✅ **User Benefits**:
- View cached content offline
- Clear indication of offline state
- No data loss during network issues
- Seamless experience across online/offline transitions

✅ **Developer Benefits**:
- Type-safe offline storage utilities
- Reusable network status hook
- Consistent offline handling pattern
- Easy to extend to more features

## Related Documentation
- [Caching Implementation](./CACHING_IMPLEMENTATION.md)
- [API Integration](./API_INTEGRATION.md)
- [Error Handling](./API_README.md)
