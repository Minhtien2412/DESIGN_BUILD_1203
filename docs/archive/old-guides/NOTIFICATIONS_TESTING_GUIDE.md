# 🧪 Testing Guide - Real-time Notifications

**Status:** ✅ Code Complete - Ready to Test  
**Estimated Test Time:** 30 minutes

---

## ⚙️ Prerequisites

### Backend Requirements
- ✅ Node.js installed
- ✅ PostgreSQL running
- ✅ `.env` file configured

### Frontend Requirements
- ✅ Expo app running (`npm start`)
- ✅ Device/emulator connected

---

## 🚀 Step 1: Start Backend (10 minutes)

### Terminal 1: Backend Server

```powershell
# Navigate to backend
cd BE-baotienweb.cloud

# Install dependencies (if needed)
npm install

# Start in development mode
npm run start:dev

# ✅ Wait for these messages:
# [Nest] Application successfully started
# [NotificationsGateway] Gateway initialized
# [NestApplication] Listening on http://localhost:3000
```

**Expected Output:**
```
[Nest] 12345  - 12/19/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 12/19/2025, 10:00:01 AM     LOG [InstanceLoader] NotificationsModule dependencies initialized
[Nest] 12345  - 12/19/2025, 10:00:01 AM     LOG [SocketServer] Namespace /notifications is listening on port 3000
[Nest] 12345  - 12/19/2025, 10:00:02 AM     LOG [NestApplication] Nest application successfully started
```

**If errors occur:**
- Check PostgreSQL is running: `Get-Service postgresql*`
- Check `.env` file has DATABASE_URL
- Check port 3000 not in use: `netstat -ano | findstr :3000`

---

## 🧪 Step 2: Test WebSocket Connection (5 minutes)

### Option A: Using wscat (Recommended)

```powershell
# Install wscat globally
npm install -g wscat

# Connect to notifications namespace
wscat -c "ws://localhost:3000/notifications"

# ✅ You should see: Connected

# Send register event
{"event":"register","data":{"userId":22}}

# ✅ You should receive:
# {"event":"registered","data":{"success":true,"userId":22,"deviceCount":1}}
```

### Option B: Using Browser Console

1. Open browser: http://localhost:3000
2. Open DevTools Console (F12)
3. Paste this code:

```javascript
const socket = io('http://localhost:3000/notifications');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  socket.emit('register', { userId: 22 });
});

socket.on('registered', (data) => {
  console.log('✅ Registered:', data);
});

socket.on('notification', (notification) => {
  console.log('🔔 Notification:', notification);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
});
```

**Expected Console Output:**
```
✅ Connected: abc123
✅ Registered: {success: true, userId: 22, deviceCount: 1}
```

---

## 📱 Step 3: Test Frontend Connection (5 minutes)

### Terminal 2: Mobile App (Already Running)

Your Expo app should already be running. If not:

```powershell
cd C:\tien\APP_DESIGN_BUILD05.12.2025
npm start
```

### Check Console Logs

1. Open Expo app on device/web
2. Login with user ID 22
3. Watch terminal output for these logs:

**Expected Logs:**
```
[Notifications] Setting up WebSocket connection for user: 22
[Notifications] Connecting to: wss://baotienweb.cloud/notifications
[Notifications] WebSocket connected - Socket ID: xyz789
[Notifications] Registering user: 22
[Notifications] ✅ Registered successfully: {success: true, userId: 22}
```

**If connection fails:**
- Check ENV.WS_URL in config/env.ts
- Try changing to local: `ws://localhost:3000` (for web testing)
- Check backend is running on port 3000

---

## 🎯 Step 4: Test End-to-End (10 minutes)

### Test Scenario 1: Create Notification via API

**Terminal 3: Send API Request**

```powershell
# Get your auth token first (from app or Postman)
$TOKEN = "your-jwt-token-here"

# Create notification
curl -X POST http://localhost:3000/api/v1/notifications `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{
    "userId": 22,
    "type": "info",
    "title": "Test Real-time Notification",
    "message": "This should appear INSTANTLY in your app!",
    "priority": "high"
  }'
```

**Alternative: No Token Required (for testing)**

If backend allows public notification creation for testing:

```powershell
curl -X POST http://localhost:3000/api/v1/notifications `
  -H "Content-Type: application/json" `
  -d '{
    "userId": 22,
    "type": "success",
    "title": "🎉 Test Successful!",
    "message": "WebSocket real-time delivery working!",
    "priority": "urgent"
  }'
```

### ✅ Expected Results

**1. Backend Logs (Terminal 1):**
```
[NotificationsService] Sent real-time notification to user 22
[NotificationsGateway] Sent notification to user 22 (1 device(s))
```

**2. Frontend Logs (Terminal 2):**
```
[Notifications] 🔔 Received real-time notification: {
  id: "123",
  title: "Test Real-time Notification",
  message: "This should appear INSTANTLY in your app!",
  type: "info",
  priority: "high"
}
```

**3. Mobile App UI:**
- ✅ Toast notification appears at top
- ✅ Badge count increases
- ✅ Notification appears in list (no refresh!)
- ✅ All happens in < 1 second

---

### Test Scenario 2: Multi-device Support

**Test on 2 devices simultaneously:**

1. **Device 1:** Web browser (http://localhost:8081)
   - Login as user 22
   - Open DevTools Console

2. **Device 2:** Mobile app/emulator
   - Login as user 22

3. **Send notification:**
   ```powershell
   curl -X POST http://localhost:3000/api/v1/notifications `
     -H "Content-Type: application/json" `
     -d '{
       "userId": 22,
       "type": "info",
       "title": "Multi-device Test",
       "message": "You should see this on BOTH devices!",
       "priority": "normal"
     }'
   ```

**✅ Expected:** 
- Both devices receive notification simultaneously
- Backend logs: "Sent to user 22 (2 devices)"

---

### Test Scenario 3: Offline → Online

**Test graceful degradation:**

1. **Disconnect:** Close app or disable WebSocket
2. **Create notification** while offline:
   ```powershell
   curl -X POST http://localhost:3000/api/v1/notifications `
     -H "Content-Type: application/json" `
     -d '{
       "userId": 22,
       "type": "warning",
       "title": "Offline Notification",
       "message": "You will see this when you reconnect",
       "priority": "high"
     }'
   ```

3. **Backend logs:** "User 22 not connected - notification saved to DB only"

4. **Reconnect:** Open app again

5. **✅ Expected:**
   - Notification appears in list (fetched from DB via REST)
   - Badge count correct
   - No lost messages

---

### Test Scenario 4: Stress Test (Optional)

**Send 10 notifications rapidly:**

```powershell
# PowerShell loop
for ($i=1; $i -le 10; $i++) {
  curl -X POST http://localhost:3000/api/v1/notifications `
    -H "Content-Type: application/json" `
    -d "{
      `"userId`": 22,
      `"type`": `"info`",
      `"title`": `"Notification #$i`",
      `"message`": `"Stress test message $i`",
      `"priority`": `"normal`"
    }"
  Start-Sleep -Milliseconds 500
}
```

**✅ Expected:**
- All 10 notifications delivered
- No crashes
- All toasts show (may queue)
- Badge count = +10

---

## 🐛 Troubleshooting

### Issue 1: "WebSocket connection failed"

**Symptoms:**
```
[Notifications] WebSocket connection error: Error: connect ECONNREFUSED
```

**Solutions:**

```powershell
# 1. Check backend is running
Get-Process -Name node

# 2. Check port 3000 is listening
netstat -ano | findstr :3000

# 3. Try connecting manually
wscat -c "ws://localhost:3000/notifications"

# 4. Check ENV.WS_URL
# Should be: ws://localhost:3000 (for local testing)
#        or: wss://baotienweb.cloud (for production)
```

---

### Issue 2: "Notifications not appearing"

**Debug checklist:**

```javascript
// 1. Check WebSocket connected
console.log('Connected:', socketRef.current?.connected)

// 2. Check user registered
// Should see "Registered successfully" in logs

// 3. Check userId matches
// Notification userId must match logged-in user

// 4. Check backend logs
// Should see "Sent notification to user X"
```

**Common causes:**
- UserId mismatch (sending to user 22 but logged in as user 45)
- WebSocket not registered (missed 'register' event)
- Backend not calling gateway.sendToUser()

---

### Issue 3: "Toast not showing"

**Check Toast is configured:**

```typescript
// app/_layout.tsx should have:
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <>
      {/* Your app */}
      <Toast />  {/* ← Must be at root level */}
    </>
  );
}
```

**Test Toast directly:**
```javascript
Toast.show({
  type: 'success',
  text1: 'Test Toast',
  text2: 'This is a test'
});
```

---

### Issue 4: "Backend errors on create"

**Check Prisma schema:**

```powershell
# Regenerate Prisma client
cd BE-baotienweb.cloud
npx prisma generate

# Check database
npx prisma studio
# Open http://localhost:5555
# Verify 'notifications' table exists
```

---

## ✅ Success Criteria Checklist

After all tests:

- [ ] Backend starts without errors
- [ ] WebSocket gateway initializes
- [ ] Frontend connects to WebSocket
- [ ] User registration successful
- [ ] POST /api/v1/notifications creates notification
- [ ] Backend logs show "Sent real-time notification"
- [ ] Frontend receives notification event
- [ ] Toast appears in app
- [ ] Badge count increases
- [ ] Notification appears in list
- [ ] Multi-device delivery works
- [ ] Offline notifications saved to DB
- [ ] Reconnection works automatically
- [ ] No crashes or errors

---

## 📊 Performance Benchmarks

**Expected timings:**

| Operation | Target | Actual |
|-----------|--------|--------|
| WebSocket connection | < 500ms | _____ |
| User registration | < 100ms | _____ |
| Notification creation (DB) | < 50ms | _____ |
| WebSocket delivery | < 100ms | _____ |
| Toast display | < 50ms | _____ |
| **End-to-end (API → Toast)** | **< 300ms** | **_____** |

**Fill in "Actual" after testing!**

---

## 🎯 Next Steps After Successful Testing

1. **Deploy to VPS:**
   ```bash
   # Copy gateway file to server
   scp BE-baotienweb.cloud/src/notifications/notifications.gateway.ts \
       root@baotienweb.cloud:/var/www/baotienweb.cloud/BE-baotienweb.cloud/src/notifications/

   # SSH and rebuild
   ssh root@baotienweb.cloud
   cd /var/www/baotienweb.cloud/BE-baotienweb.cloud
   npm run build
   pm2 restart baotienweb-api
   ```

2. **Test on Production:**
   - Change ENV.WS_URL to `wss://baotienweb.cloud/notifications`
   - Test from real devices
   - Monitor with `pm2 logs baotienweb-api`

3. **Add More Features:**
   - Notification categories
   - Mark as read from toast
   - Navigation to detail
   - Sound effects

---

**Ready to test?** Start with Step 1! 🚀
