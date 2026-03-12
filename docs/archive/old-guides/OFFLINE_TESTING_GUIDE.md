# Test Chức Năng Offline Notifications

## Mục Đích
Kiểm tra hệ thống thông báo hoạt động đúng khi không có kết nối Internet.

## Cách Hệ Thống Offline Hoạt Động

### 1. Kiến Trúc Offline
```typescript
useNotifications Hook
  ├─ useNetworkStatus() → Detect offline
  ├─ Cache (Memory) → TTL 5 phút
  └─ Offline Storage (AsyncStorage) → Persistent
```

### 2. Flow Khi Online
```
User opens app (ONLINE)
  ↓
fetchNotifications()
  ↓
GET /api/v1/notifications
  ↓
Save to: Memory Cache + Offline Storage
  ↓
Display notifications + badge count
```

### 3. Flow Khi Offline
```
User opens app (OFFLINE)
  ↓
useNetworkStatus detects no internet
  ↓
fetchNotifications() checks isOffline = true
  ↓
Load from Offline Storage (AsyncStorage)
  ↓
Display cached notifications
  ↓
Show "No Internet" message
```

## Các Bước Test

### PHẦN 1: Chuẩn Bị Dữ Liệu (Online)

1. **Mở PowerShell và chạy script gửi thông báo:**
   ```powershell
   .\send-all-notifications.ps1
   ```
   
2. **Nhập thông tin đăng nhập:**
   - Email: `test@example.com` (hoặc tài khoản của bạn)
   - Password: `Test123456`

3. **Script sẽ gửi nhiều thông báo test:**
   - Order Confirmation
   - Payment Success
   - Shipping Update
   - Promotion Alert
   - System Notification

4. **Mở app và xác nhận:**
   - Thấy badge count trên bell icon
   - Click bell → Xem danh sách thông báo
   - Tất cả thông báo hiển thị đúng

### PHẦN 2: Test Offline Mode

#### Bước 1: Enable Airplane Mode
- **Android:** Settings → Network → Airplane Mode ON
- **iOS:** Control Center → Airplane Mode ON
- **Emulator:** 
  ```
  Android: Extended Controls → Cellular → Data → Off
  iOS Simulator: Settings → Toggle Airplane Mode
  ```

#### Bước 2: Force Close App
- **Android:** Recent Apps → Swipe app away
- **iOS:** Double click home → Swipe up
- **Expo:** Kill Metro bundler terminal and reopen

#### Bước 3: Reopen App (Offline)
```
Expected Behavior:
✓ App loads successfully
✓ Notifications screen shows cached data
✓ Badge count displays last known count
✓ Can tap and read notification details
✓ "No Internet Connection" banner appears (nếu có UI)
```

#### Bước 4: Test Các Tính Năng Offline
```
Test Actions:
1. Navigate to Notifications screen
   → Should display cached notifications
   
2. Pull to refresh
   → Should show error or "No internet" message
   
3. Tap on a notification
   → Should open detail from cache
   
4. Try to mark as read
   → Should show error (can't sync to server)
```

### PHẦN 3: Test Reconnection (Back Online)

#### Bước 1: Disable Airplane Mode
- Turn OFF Airplane Mode
- Wait for connection (WiFi/Mobile Data)

#### Bước 2: Return to App
```
Expected Behavior:
✓ Auto detects internet restored
✓ "No Internet" banner disappears
✓ Pull to refresh fetches new data
✓ Badge count updates with server data
✓ New notifications appear
```

#### Bước 3: Verify Sync
```
1. Pull to refresh notifications
2. Check badge count matches server
3. New notifications (sent while offline) now appear
4. Mark as read syncs to server
```

## Verification Checklist

### ✅ Offline Functionality
- [ ] App loads without crash when offline
- [ ] Cached notifications display correctly
- [ ] Badge count shows last known value
- [ ] Can read notification details
- [ ] No "white screen" or errors

### ✅ Online Recovery
- [ ] Auto-detects internet restoration
- [ ] Syncs new notifications automatically
- [ ] Badge count updates to real-time value
- [ ] Mark as read/delete operations work
- [ ] No duplicate notifications

### ✅ Edge Cases
- [ ] First launch offline → Shows empty state (no cache)
- [ ] Partial sync (connection drops mid-request)
- [ ] Airplane mode toggle multiple times
- [ ] App backgrounded during offline → Resumes correctly

## Technical Implementation Details

### Hook: `hooks/useNotifications.ts`
```typescript
// Line 32-43: Offline detection
if (isOffline) {
  console.log('[useNotifications] Device offline, using offline storage');
  const offlineData = await getOfflineData<Notification[]>(OFFLINE_KEY);
  if (offlineData) {
    setNotifications(offlineData);
    const unread = offlineData.filter(n => !n.isRead).length;
    setUnreadCount(unread);
    setLoading(false);
    setError(null);
    return;
  }
  throw new Error('No offline data available...');
}
```

### Storage Keys
- **Memory Cache:** `'notifications:all'` (TTL: 5 min)
- **Offline Storage:** `'notifications_offline'` (Persistent)

### Network Detection: `hooks/useNetworkStatus.ts`
```typescript
// Uses @react-native-community/netinfo
const { isOffline } = useNetworkStatus();
// isOffline = true → No internet
// isOffline = false → Connected
```

## Debugging Commands

### Check Offline Storage (React Native Debugger)
```javascript
// In browser console
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getItem('notifications_offline').then(console.log);
```

### Clear Offline Cache
```javascript
AsyncStorage.removeItem('notifications_offline');
```

### Monitor Network Status
```javascript
// Add to useNotifications.ts temporarily
console.log('[Network]', { isOffline, hasInternet: !isOffline });
```

## Test Data Script

Nếu cần gửi thông báo test nhanh:

```powershell
# File: quick-send-notification.ps1
$baseUrl = "https://baotienweb.cloud/api/v1"
$email = "test@example.com"
$password = "Test123456"

# Login
$loginData = @{ email = $email; password = $password } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $login.token

# Send notification
$notif = @{
    title = "Offline Test $(Get-Date -Format 'HH:mm:ss')"
    body = "Testing offline functionality"
    type = "info"
    priority = "normal"
} | ConvertTo-Json

$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif

Write-Host "Notification sent!" -ForegroundColor Green
```

## Expected Logs

### Online Mode
```
[useNotifications] Using cached data
[useNotifications] Background refresh...
[useNotifications] Fetched 5 notifications
```

### Offline Mode
```
[useNotifications] Device offline, using offline storage
[useNotifications] Loaded 5 notifications from offline cache
```

### Back Online
```
[useNetworkStatus] Connection restored
[useNotifications] Syncing with server...
[useNotifications] Fetched 7 notifications (2 new)
```

## Troubleshooting

### Issue: No notifications when offline
**Cause:** No data in offline storage (never fetched online)
**Fix:** Open app online first, then test offline

### Issue: Stale data showing
**Cause:** Cache TTL too long or not invalidating
**Fix:** Pull to refresh or check cache expiry logic

### Issue: Badge count wrong
**Cause:** Count calculated from stale cache
**Fix:** Ensure unreadCount recalculates from cached data

## Next Steps

Sau khi test offline xong:
1. ✅ Verify all offline features work
2. ✅ Test edge cases (slow connection, intermittent)
3. 📝 Document any bugs found
4. 🔧 Fix issues if needed
5. ✨ Add UI feedback (offline banner, sync indicator)

---

**Test Status:** Ready for testing
**Dependencies:** 
- `@react-native-community/netinfo` ✓
- `@react-native-async-storage/async-storage` ✓
- Backend API: `https://baotienweb.cloud` ✓
