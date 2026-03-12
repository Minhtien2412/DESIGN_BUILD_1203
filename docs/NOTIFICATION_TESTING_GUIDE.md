# 📝 Notification System Testing Guide

## Phase 2: WebSocket Fix - Testing Checklist

### Prerequisites

- Expo dev server running (`npm start`)
- Device/simulator ready to run app

### Demo Credentials

```
Email: testuser1@baotienweb.cloud
Password: Test@123456
User ID: 8
```

---

## 🔌 Test 1: WebSocket Connection

### Steps:

1. Open the app on device/simulator
2. Go to Login screen
3. Login with demo credentials above
4. Open Metro Bundler console or device logs

### Expected Console Logs:

```
🔌 [UnifiedNotification] Connecting WebSocket to wss://baotienweb.cloud/notifications
✅ [UnifiedNotification] WebSocket connected!
📝 [UnifiedNotification] Registering userId: 8
✅ [UnifiedNotification] Registered successfully: { userId: 8 }
```

### If Connection Fails:

- Check `❌ [UnifiedNotification] WebSocket connection error` in logs
- Verify `EXPO_PUBLIC_WS_URL` is set correctly in `.env`
- Check network connectivity

---

## 🔔 Test 2: Receive Notifications

### Option A: Backend sends notification (if API works)

Run the test script:

```powershell
cd scripts
.\test-notification-websocket.ps1
```

### Option B: Manually via WebSocket test

1. Open `websocket-test.html` in browser
2. Connect to `wss://baotienweb.cloud/notifications`
3. Emit `register` with `{ userId: 8 }`
4. Server should send `notification` events

### Expected Console Logs when notification received:

```
🔔 [UnifiedNotification] Received notification: { id: xxx, type: "SYSTEM", ... }
```

---

## 📋 Test 3: Notification Display

### Steps:

1. While logged in, navigate to Notifications tab (or bell icon)
2. Pull to refresh
3. Check notifications list

### Expected Behavior:

- Notifications should load from API
- Real-time notifications should appear at top
- Badge count should update
- Tapping notification should navigate to relevant screen

---

## ✅ Phase 2 Completion Criteria

| Test                 | Status | Notes                                    |
| -------------------- | ------ | ---------------------------------------- |
| WebSocket connects   | ⬜     | Check logs for "connected"               |
| User registration    | ⬜     | Check logs for "Registered successfully" |
| Receive notification | ⬜     | Check logs for "Received notification"   |
| Reconnection works   | ⬜     | Kill app, reopen, check reconnect        |
| Badge updates        | ⬜     | Check unread count changes               |

---

## 🐛 Troubleshooting

### WebSocket won't connect

1. Check if `EXPO_PUBLIC_WS_URL` is correct:
   ```
   EXPO_PUBLIC_WS_URL=https://baotienweb.cloud
   ```
2. Backend WebSocket gateway must be running on `/notifications` namespace

### Not receiving notifications

1. Check if `register` event was emitted with correct userId
2. Verify backend notification gateway sends `notification` event (not `notification:new`)
3. Check if user is authenticated before WebSocket connects

### Reconnection issues

1. Should attempt up to 10 reconnects
2. Delays: 2s → 4s → 6s → 8s → 10s (max)
3. Should re-register userId after each reconnect

---

## 📊 Files Modified in Phase 2

| File                                           | Changes                                              |
| ---------------------------------------------- | ---------------------------------------------------- |
| `context/UnifiedNotificationContext.tsx`       | Enhanced logging, reconnection, userId validation    |
| `services/notificationRealtimeService.ts`      | Listen to both `notification` AND `notification:new` |
| `services/socket.ts`                           | `onNotification()` listens to both event names       |
| `docs/NOTIFICATION_SYSTEM_DEVELOPMENT_PLAN.md` | Updated Phase 2 as completed                         |
