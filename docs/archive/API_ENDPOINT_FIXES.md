# API Endpoint Fixes - December 19, 2025

## 🔧 Issues Fixed

### 1. **Notification Endpoint 404 Error** ✅ FIXED

**Problem:**
```
WARN  [Notifications] Endpoint not found (404). Using empty list.
LOG  [API] Sending request with API key to: /api/notifications
```

**Root Cause:**
- Frontend was calling `/api/notifications`
- Backend expects `/api/v1/notifications` (with version prefix)

**Solution:**
Updated [api-endpoints.ts](constants/api-endpoints.ts):
```diff
- LIST: '/api/notifications'
+ LIST: '/api/v1/notifications'

- UNREAD_COUNT: '/api/notifications/unread-counts'
+ UNREAD_COUNT: '/api/v1/notifications/unread-count'

- MARK_READ: (id) => `/api/notifications/${id}/read`
+ MARK_READ: (id) => `/api/v1/notifications/${id}/read`
```

**Method Fixes:**
```diff
// NotificationContext.tsx
- method: 'POST'  // Wrong!
+ method: 'PATCH' // Correct (matches backend)
```

---

### 2. **Call Endpoints Mismatched** ✅ FIXED

**Problem:**
Backend uses `/api/v1/call` but frontend was calling `/api/calls`

**Solution:**
```diff
- CALLS: '/api/calls'
+ CALLS: '/api/v1/call/history'

- END_CALL: (id) => `/api/calls/${id}/end`
+ END_CALL: '/api/v1/call/end'
```

---

### 3. **Messaging Endpoints Updated** ✅ FIXED

Added `/v1` prefix to all messaging endpoints:
```diff
- CONVERSATIONS: '/api/messages/conversations'
+ CONVERSATIONS: '/api/v1/messages/conversations'
```

---

### 4. **Project Endpoints Updated** ✅ FIXED

Added `/v1` prefix for consistency:
```diff
- LIST: '/api/projects'
+ LIST: '/api/v1/projects'
```

---

## 📊 Backend API Structure (Reference)

All backend endpoints use this structure:
```
https://baotienweb.cloud/api/v1/<module>/<endpoint>
```

**Examples:**
- ✅ `/api/v1/notifications` - List notifications
- ✅ `/api/v1/call/history` - Call history
- ✅ `/api/v1/messages/conversations` - Conversations
- ✅ `/api/v1/projects` - Projects list
- ✅ `/api/v1/comments` - Comments

---

## ✅ Testing Verification

After fixes, test these endpoints:

**1. Notifications:**
```bash
# Should return 200 (not 404)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://baotienweb.cloud/api/v1/notifications
```

**2. Call History:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://baotienweb.cloud/api/v1/call/history
```

**3. Messages:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://baotienweb.cloud/api/v1/messages/conversations
```

---

## 🚀 Next Steps

Now that API endpoints are fixed, you can proceed with:

### **Option A: Deploy WebRTC Fixes (5 min)** 🔴 RECOMMENDED
```bash
.\deploy-backend-webrtc.ps1
```
- Fix call signaling bugs
- Enable video calling end-to-end
- **Quick win!**

### **Option B: Add Notifications WebSocket (2h)**
Create real-time notification delivery:
1. Backend: Create `notifications.gateway.ts`
2. Frontend: Connect to WebSocket
3. Show instant notifications

### **Option C: Integrate LiveKit (4h)**
Add multi-party video rooms:
1. Install `@livekit/react-native`
2. Create video room screens
3. Connect to backend LiveKit API

### **Option D: Build Chat UI (6h)**
Create messaging interface:
1. Chat list screen
2. Conversation screen
3. Message bubbles
4. Connect to existing ChatContext

---

## 🎯 Recommendation

**Do Option A first (5 minutes)** - Deploy backend fixes now while Expo is running. This unblocks video calling testing.

Then choose B, C, or D based on priority:
- **Need real-time alerts?** → Choose B (Notifications)
- **Need video conferencing?** → Choose C (LiveKit)
- **Need messaging?** → Choose D (Chat UI)

---

**Files Modified:**
- ✅ `constants/api-endpoints.ts` - Updated all endpoints with /v1 prefix
- ✅ `context/NotificationContext.tsx` - Changed POST to PATCH methods

**Status:** Ready to test! 🚀
