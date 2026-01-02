# Automatic Permission Request - System Implementation

## 🎯 Overview

Thay đổi cơ chế xin quyền từ **popup modal trong app** sang **hệ thống tự động yêu cầu** khi app khởi động lần đầu.

---

## ✅ Changes Made

### 1. **PermissionContext.tsx** - Complete Rewrite

**Before:**
- ✅ Hiện popup modal nhắc quyền sau 3 giây
- ❌ Popup lặp lại mỗi 3 phút
- ❌ Người dùng phải tắt popup thủ công

**After:**
- ✅ Tự động request quyền hệ thống khi app khởi động lần đầu
- ✅ Chỉ hỏi 1 lần duy nhất
- ✅ Không có popup trong app nữa
- ✅ Setup background tasks để nhận notifications & calls

**New Features:**
```typescript
// Auto-request all permissions on first launch
const requestInitialPermissions = async () => {
  const alreadyAsked = await getItem(STORAGE_KEY_INITIAL_REQUEST_DONE);
  
  if (alreadyAsked !== 'true') {
    // Request from system
    await Promise.all([
      Camera.requestCameraPermissionsAsync(),
      Location.requestForegroundPermissionsAsync(),
      Notifications.requestPermissionsAsync(),
    ]);
    
    await setItem(STORAGE_KEY_INITIAL_REQUEST_DONE, 'true');
  }
};

// Register background tasks
const setupBackgroundTasks = async () => {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
  
  await BackgroundFetch.registerTaskAsync(BACKGROUND_CALL_TASK, {
    minimumInterval: 60 * 5, // 5 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
};
```

---

### 2. **app/_layout.tsx** - Remove Modal

**Before:**
```tsx
<PermissionReminderModal />
<IncomingCallModal />
```

**After:**
```tsx
<IncomingCallModal />
// PermissionReminderModal completely removed
```

---

### 3. **app.json** - Background Modes

**iOS Background Modes:**
```json
"infoPlist": {
  "UIBackgroundModes": [
    "fetch",              // Background fetch
    "remote-notification", // Push notifications
    "processing",         // Background processing
    "voip"                // VoIP calls
  ]
}
```

**Android Permissions:**
```json
"permissions": [
  "android.permission.RECEIVE_BOOT_COMPLETED",  // Start on boot
  "android.permission.WAKE_LOCK",                // Keep CPU awake
  "android.permission.FOREGROUND_SERVICE",       // Foreground service
  "android.permission.POST_NOTIFICATIONS"        // Android 13+
]
```

---

### 4. **New Packages Installed**

```bash
npm install expo-background-fetch expo-task-manager
```

- **expo-background-fetch**: Run tasks in background periodically
- **expo-task-manager**: Manage background tasks lifecycle

---

## 🔄 User Flow

### First Launch (Lần đầu mở app)

```
1. App khởi động
   ↓
2. PermissionContext mount
   ↓
3. requestInitialPermissions() được gọi
   ↓
4. Hệ thống hiện dialog hỏi quyền:
   - Camera (dialog 1)
   - Location (dialog 2)  
   - Notifications (dialog 3)
   ↓
5. Người dùng chọn:
   - "Allow" / "Cho phép"
   - "Don't Allow" / "Không cho phép"
   ↓
6. Lưu flag: initial_permission_request_done = true
   ↓
7. Setup background tasks nếu có quyền
   ↓
8. App sẵn sàng sử dụng
```

### Subsequent Launches (Các lần sau)

```
1. App khởi động
   ↓
2. Check: initial_permission_request_done = true
   ↓
3. Skip permission request (không hỏi nữa)
   ↓
4. Check permission status
   ↓
5. Setup background tasks nếu có quyền
   ↓
6. App sẵn sàng
```

### Khi Cần Quyền Đặc Biệt (e.g. Camera cho video call)

```
1. User taps video call button
   ↓
2. VideoCallManager.getUserMedia()
   ↓
3. Check camera permission
   ↓
4. Nếu "denied":
   - Hiện alert yêu cầu vào Settings
   - Hướng dẫn bật quyền
   ↓
5. Nếu "granted":
   - Tiếp tục video call
```

---

## 📱 Background Tasks

### BACKGROUND_NOTIFICATION_TASK
- **Purpose**: Nhận notifications khi app đóng
- **Interval**: 15 phút
- **Actions**:
  - Check server for new notifications
  - Display local notification
  - Update badge count

### BACKGROUND_CALL_TASK
- **Purpose**: Nhận cuộc gọi khi app đóng
- **Interval**: 5 phút
- **Actions**:
  - Listen for incoming calls
  - Show incoming call notification
  - Wake app to accept call

### Task Registration

```typescript
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    console.log('[Background] Notification task running');
    
    // Fetch new notifications from server
    const notifications = await fetchNotifications();
    
    // Show local notification
    if (notifications.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notifications[0].title,
          body: notifications[0].body,
        },
        trigger: null,
      });
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
```

---

## 🧪 Testing

### Test Permission Request

1. **First Install:**
   ```bash
   # Uninstall app
   adb uninstall com.adminmarketingnx.APP_DESIGN_BUILD
   
   # Clear storage (optional)
   npx expo start --clear
   
   # Install & run
   npm run run:dev:android
   ```

2. **Expected:**
   - 3 system dialogs xuất hiện lần lượt
   - Không có popup modal trong app
   - Quyền được lưu vĩnh viễn

3. **Verify Storage:**
   ```typescript
   // In console
   const done = await getItem('initial_permission_request_done');
   console.log(done); // Should be 'true'
   ```

### Test Background Tasks

1. **Grant Notification Permission**
2. **Close App (swipe from recent apps)**
3. **Wait 5-15 minutes**
4. **Check:** App should receive notifications/calls in background

### Test Settings Redirect

1. **Deny Camera Permission**
2. **Try to start video call**
3. **Expected:**
   - Alert: "Camera permission required"
   - Button: "Open Settings"
   - Tap → Opens system settings

---

## 🔧 Configuration

### Adjust Background Interval

```typescript
// PermissionContext.tsx
await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
  minimumInterval: 60 * 10, // Change to 10 minutes
  stopOnTerminate: false,
  startOnBoot: true,
});
```

### Reset Permission Request (For Testing)

```typescript
import { setItem } from '@/utils/storage';

// Reset flag
await setItem('initial_permission_request_done', 'false');

// Restart app → Will ask permissions again
```

---

## 📊 API Changes

### PermissionContext (Removed)
- ❌ `showPermissionReminder: boolean`
- ❌ `dismissReminder: () => void`
- ❌ `resetReminderState: () => Promise<void>`

### PermissionContext (Kept)
- ✅ `permissions: PermissionState`
- ✅ `requestCameraPermission: () => Promise<boolean>`
- ✅ `requestLocationPermission: () => Promise<boolean>`
- ✅ `requestNotificationPermission: () => Promise<boolean>`
- ✅ `requestAllPermissions: () => Promise<void>`
- ✅ `hasAllPermissions: boolean`

---

## 🚨 Important Notes

### iOS Requirements
- Background modes **require Apple Developer account**
- Must enable **Background fetch** & **Remote notifications** in Xcode
- VoIP requires special entitlements

### Android Requirements
- Android 13+ requires **runtime permission** for POST_NOTIFICATIONS
- Background tasks may be killed by battery optimization
- Add app to "Battery optimization whitelist" in Settings

### Production Checklist
- [ ] Test on physical device (emulator may not support background)
- [ ] Test with app fully closed (not just minimized)
- [ ] Test with different permission combinations
- [ ] Test Settings redirect when permission denied
- [ ] Verify background tasks run correctly
- [ ] Monitor battery usage

---

## 🐛 Troubleshooting

### Issue: Permissions not requested on first launch
**Solution:**
```bash
# Clear storage
await setItem('initial_permission_request_done', 'false');
# Restart app
```

### Issue: Background tasks not running
**Check:**
1. Notification permission granted?
2. App in battery optimization whitelist?
3. Background data enabled?
4. Task registered successfully?
   ```typescript
   const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
   console.log('Task registered:', isRegistered);
   ```

### Issue: System dialog appears multiple times
**Cause:** `initial_permission_request_done` not saved
**Solution:**
```typescript
// Check if setItem is working
await setItem('test', 'value');
const test = await getItem('test');
console.log(test); // Should be 'value'
```

---

## 📚 References

- [Expo Background Fetch](https://docs.expo.dev/versions/latest/sdk/background-fetch/)
- [Expo Task Manager](https://docs.expo.dev/versions/latest/sdk/task-manager/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS Background Modes](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server)
- [Android Background Work](https://developer.android.com/guide/background)

---

**Implemented by:** AI Assistant  
**Date:** December 19, 2025  
**Status:** ✅ Complete & Ready for Testing
