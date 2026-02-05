# ANR Prevention - Startup Optimization Summary

## Vấn đề gốc

App bị treo/hiển thị dialog "Đợi hoặc đóng ứng dụng" do:

1. Quá nhiều Provider (20+) khởi tạo đồng thời
2. Tất cả useEffect chạy ngay khi mount
3. AsyncStorage, API calls, WebSocket connections chạy trên main thread
4. Không có cơ chế deferring/phasing cho các tác vụ nặng

## Giải pháp đã implement

### 1. DeferredProviders Component (`components/DeferredProviders.tsx`)

```typescript
// 3 phases:
// - Phase 1: Immediate sau first frame (requestAnimationFrame)
// - Phase 2: Sau InteractionManager + 500ms delay
// - Phase 3: Deferred + 1500ms total

<DeferredProviderWrapper>
  <LazyProvider waitForPhase={1}>...</LazyProvider>  // Phase 2 providers
  <LazyProvider waitForPhase={2}>...</LazyProvider>  // Phase 3 providers
</DeferredProviderWrapper>
```

### 2. Provider Order in `_layout.tsx`

**Phase 1 (Essential - load immediately):**

- GlobalTextSafetyProvider
- FullMediaViewerProvider
- PermissionProvider
- AuthProvider
- PerfexAuthProvider
- CartProvider

**Phase 2 (LazyProvider waitForPhase={1}):**

- FavoritesProvider
- ViewHistoryProvider
- UtilitiesProvider
- ProjectDataProvider
- ProfileProvider

**Phase 3 (LazyProvider waitForPhase={2}):**

- MeetingProvider
- CallProvider
- CommunicationHubProvider
- WebSocketProvider
- ProgressWebSocketProvider
- VideoInteractionsProvider
- UnifiedNotificationProvider
- UnifiedBadgeProvider

### 3. Deferred useEffect trong các Context

| Context                    | Thay đổi                                                 | Delay  |
| -------------------------- | -------------------------------------------------------- | ------ |
| AuthContext                | `requestAnimationFrame` → loadSession                    | ~16ms  |
| CartContext                | `requestAnimationFrame` → loadCart                       | ~16ms  |
| FavoritesContext           | `requestAnimationFrame` → loadFavorites                  | ~16ms  |
| ViewHistoryContext         | `requestAnimationFrame` → loadHistory                    | ~16ms  |
| UtilitiesContext           | `requestAnimationFrame` → loadData                       | ~16ms  |
| PerfexAuthContext          | `requestAnimationFrame` → loadSession                    | ~16ms  |
| VideoInteractionsContext   | `requestAnimationFrame` → loadDeviceId, loadInteractions | ~16ms  |
| UnifiedBadgeContext        | `requestAnimationFrame` → loadFromStorage                | ~16ms  |
| UnifiedNotificationContext | `setTimeout` → initialize                                | 1000ms |
| CallContext                | `setTimeout` → connectSocket                             | 2000ms |
| MeetingContext             | `setTimeout` → requestPermissions                        | 1500ms |
| useHomeData                | `setTimeout` → fetchData                                 | 500ms  |

### 4. Analytics Session Init

```typescript
// Deferred 2 seconds
setTimeout(() => {
  InteractionManager.runAfterInteractions(() => {
    initAnalyticsSession();
  });
}, 2000);
```

### 5. WebSocket Connections (Already disabled)

- WebSocketContext: `autoConnect = false`
- ProgressWebSocketContext: `autoConnect = false`
- CommunicationHubContext: `ENABLE_WEBSOCKET = false`

### 6. Startup Optimizer Service (`services/startupOptimizer.ts`)

- Task queue với priority levels: critical, high, normal, low, idle
- Batch operations để giảm main thread blocking
- Helper functions: `deferToNextFrame`, `deferUntilIdle`, `batchOperations`

## Timeline khởi động mới

```
0ms     - App start, render empty shell
16ms    - Phase 1: Essential providers ready
         - Auth starts loading session
         - Cart, Favorites, ViewHistory start loading from AsyncStorage
500ms   - Phase 2: Deferred providers ready
         - useHomeData starts fetching
1000ms  - UnifiedNotification starts initializing
1500ms  - Phase 3: Communication providers ready
         - MeetingProvider requests location
         - Push notifications setup
2000ms  - CallContext connects WebSocket
         - Analytics session initialized
         - Notification WebSocket connects
```

## Kết quả mong đợi

- ✅ UI render ngay lập tức (< 500ms)
- ✅ Không còn ANR dialog
- ✅ Data loading progressive, không block
- ✅ WebSocket connections deferred đến khi cần
- ✅ Main thread không bị block

## Files đã thay đổi

1. `components/DeferredProviders.tsx` - NEW
2. `services/startupOptimizer.ts` - NEW
3. `app/_layout.tsx` - Modified provider tree
4. `context/AuthContext.tsx` - Deferred loadSession
5. `context/cart-context.tsx` - Deferred loadCart
6. `context/FavoritesContext.tsx` - Deferred loadFavorites
7. `context/ViewHistoryContext.tsx` - Deferred loadHistory
8. `context/UtilitiesContext.tsx` - Deferred loadData
9. `context/PerfexAuthContext.tsx` - Deferred loadSession
10. `context/VideoInteractionsContext.tsx` - Deferred init
11. `context/UnifiedBadgeContext.tsx` - Deferred loadFromStorage
12. `context/UnifiedNotificationContext.tsx` - Deferred initialization
13. `context/CallContext.tsx` - Deferred WebSocket connection
14. `context/MeetingContext.tsx` - Deferred location permission
15. `hooks/useHomeData.ts` - Deferred initial fetch

## Testing checklist

- [ ] App khởi động < 3 giây trên thiết bị trung bình
- [ ] Không hiển thị ANR dialog
- [ ] UI responsive ngay sau khi load
- [ ] Data hiển thị progressive
- [ ] WebSocket chỉ connect khi cần
- [ ] Không có memory leak từ cleanup functions

---

_Updated: 2026-01-29_
