# 📱 PHÂN TÍCH HỆ THỐNG COMMUNICATION - Chat, Call, WebSocket

> **Ngày phân tích:** 2025-01-24  
> **Trạng thái:** ✅ Đã fix các lỗi critical

---

## 📊 TỔNG QUAN KIẾN TRÚC

### Frontend (Expo/React Native)

```
┌─────────────────────────────────────────────────────────────┐
│                      APP LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  app/messages/[userId].tsx   │   app/call/[userId].tsx      │
│  features/call/GroupCallScreen.tsx                          │
├─────────────────────────────────────────────────────────────┤
│                    CONTEXT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  context/CallContext.tsx      │  context/MeetingContext.tsx │
│  context/ChatContext.tsx      │                             │
├─────────────────────────────────────────────────────────────┤
│                   SERVICES LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  services/chatRealtime.ts      (WebSocket chat)             │
│  services/chatAPIService.ts    (API data conversion)        │
│  services/websocket/socketManager.ts (Socket.IO manager)    │
│  services/aiCustomerSupport.ts (AI CSKH - OpenAI)           │
└─────────────────────────────────────────────────────────────┘
```

### Backend (NestJS)

```
┌─────────────────────────────────────────────────────────────┐
│  BE-baotienweb.cloud                                        │
├─────────────────────────────────────────────────────────────┤
│  src/chat/                                                  │
│  ├── chat.gateway.ts     (WebSocket namespace: /chat)       │
│  ├── chat.controller.ts  (REST: /chat)                      │
│  └── chat.service.ts                                        │
├─────────────────────────────────────────────────────────────┤
│  src/call/                                                  │
│  ├── call.gateway.ts     (WebSocket namespace: /call)       │
│  ├── call.controller.ts  (REST: /call)                      │
│  └── call.service.ts                                        │
├─────────────────────────────────────────────────────────────┤
│  src/messages/                                              │
│  └── messages.controller.ts (REST: /messages)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔴 LỖI NGHIÊM TRỌNG (CRITICAL) - ✅ ĐÃ SỬA

### 1. ✅ WebSocket Event Name Mismatch - **ĐÃ FIX**

**Vị trí:** `services/chatRealtime.ts` vs `BE/src/chat/chat.gateway.ts`

| Frontend Event | Backend Event | Status   |
| -------------- | ------------- | -------- |
| `joinRoom`     | `joinRoom`    | ✅ FIXED |
| `leaveRoom`    | `leaveRoom`   | ✅ FIXED |
| `sendMessage`  | `sendMessage` | ✅ FIXED |
| `typing`       | `typing`      | ✅ OK    |

**Đã sửa:** File [services/chatRealtime.ts](services/chatRealtime.ts) - event names khớp với BE

### 2. ✅ Call Signal Missing Target User - **ĐÃ FIX**

**Vị trí:** `context/CallContext.tsx`

```typescript
// ✅ ĐÃ SỬA
socket.emit("call_signal", {
  to: calleeId, // ← Đã thêm target userId
  signal: { type: "ice-candidate", data: candidate },
});
```

**Đã sửa:** File [context/CallContext.tsx](context/CallContext.tsx) - thêm `to` param cho WebRTC signaling

### 3. ⚠️ GroupCall Chưa Có Backend Support (CHƯA FIX)

**Vị trí:** `features/call/GroupCallScreen.tsx`

- Đang dùng `MOCK_PARTICIPANTS` (mock data)
- Không có `group-call.gateway.ts` trong BE
- LiveKit/Agora chưa được integrate thực tế

---

## 🟡 LỖI CẦN SỬA (MEDIUM)

### 4. ⚠️ Multiple Socket Managers (Code Duplication)

Có **3 file** quản lý WebSocket riêng biệt:

1. `services/websocket/socketManager.ts` - Centralized (mới)
2. `services/socketManager.ts` - Legacy (cũ)
3. `services/chatRealtime.ts` - Chat specific

**Đề xuất:** Consolidate về 1 file duy nhất là `services/websocket/socketManager.ts`

### 5. ✅ Network Condition Handling - **ĐÃ CẢI THIỆN**

**Vị trí:** `context/CallContext.tsx`

```typescript
// ✅ ĐÃ SỬA - Bật reconnection với exponential backoff
reconnection: true,
reconnectionAttempts: 5,
reconnectionDelay: 1000,
reconnectionDelayMax: 10000,
transports: ['websocket', 'polling'], // Fallback support
```

### 6. ✅ AI Chat Routing - **ĐÃ IMPLEMENT**

- `services/aiCustomerSupport.ts` - OpenAI integration ✅
- `services/unifiedChatService.ts` - Added `isAIBotUser()`, `sendMessageSmart()` ✅
- Hỗ trợ phân biệt: `user -> user` vs `user -> AI`

---

## 🟢 HOẠT ĐỘNG TỐT

| Component                | Status | Notes                                   |
| ------------------------ | ------ | --------------------------------------- |
| SocketManager namespaces | ✅     | /chat, /call, /progress, /notifications |
| Token authentication     | ✅     | JWT verify ở BE gateway                 |
| 1-1 Call REST API        | ✅     | /call/start, /accept, /reject, /end     |
| IncomingCallModal        | ✅     | Vibration + UI hoàn chỉnh               |
| Call history             | ✅     | /call/history endpoint                  |
| Message read receipts    | ✅     | markAsRead event                        |
| Typing indicators        | ✅     | typingUsers tracking                    |
| Online status            | ✅     | onlineUsers Map                         |

---

## 📋 TODO LIST - VIỆC CẦN LÀM

### � ĐÃ HOÀN THÀNH

- [x] **Fix WebSocket Event Names** ✅
  - File: `services/chatRealtime.ts`
  - Changed: `join_room` → `joinRoom`, `leave_room` → `leaveRoom`, etc.
- [x] **Fix Call Signal Structure** ✅
  - File: `context/CallContext.tsx`
  - Added: `to: targetUserId` parameter

- [x] **Implement AI Chat Routing** ✅
  - File: `services/unifiedChatService.ts`
  - Added: `isAIBotUser()`, `sendMessageSmart()`, `getAIConversation()`

- [x] **Improve Network Handling** ✅
  - File: `context/CallContext.tsx`
  - Added: reconnection with exponential backoff

### 🟡 CẦN LÀM TIẾP (Priority 2 - Medium)

- [ ] **Consolidate Socket Services**
  - Keep: `services/websocket/socketManager.ts`
  - Remove/Merge: `services/socketManager.ts`
  - Update imports across codebase

- [ ] **Test WebSocket Connection End-to-End**
  - Verify FE connects to `wss://baotienweb.cloud/chat`
  - Test joinRoom, sendMessage, typing flow

### 🟢 CẦN LÀM SAU (Priority 3 - Enhancement)

- [ ] **Create GroupCall Gateway (Backend)**
  - New file: `BE/src/group-call/group-call.gateway.ts`
  - Events: `join_group_call`, `leave_group_call`, `signal_to_room`
  - Integrate SFU (LiveKit recommended)

- [ ] **Integrate LiveKit SDK (Frontend)**
  - Install: `@livekit/react-native`
  - Replace mock participants with real streams
  - Use existing `ENV.LIVEKIT_URL`

- [ ] **Add Call Recording**
  - Server-side recording via LiveKit egress
  - Storage to cloud (S3/Azure Blob)

---

## 🔧 QUICK FIX COMMANDS

### Fix 1: WebSocket Event Names

```bash
# Search & Replace in chatRealtime.ts
# 'join_room' → 'joinRoom'
# 'leave_room' → 'leaveRoom'
```

### Fix 2: Test WebSocket Connection

```typescript
// Add to any screen temporarily
import { socketManager } from "@/services/websocket/socketManager";

useEffect(() => {
  (async () => {
    const socket = await socketManager.connect("chat");
    socket.on("connect", () => console.log("✅ Chat connected"));
    socket.on("connect_error", (e) => console.log("❌ Error:", e));
  })();
}, []);
```

---

## 📁 FILES ĐÃ CHỈNH SỬA

| File                                                             | Action                    | Status  |
| ---------------------------------------------------------------- | ------------------------- | ------- |
| [services/chatRealtime.ts](services/chatRealtime.ts)             | Fix event names           | ✅ DONE |
| [context/CallContext.tsx](context/CallContext.tsx)               | Fix signal + reconnection | ✅ DONE |
| [services/unifiedChatService.ts](services/unifiedChatService.ts) | Add AI routing            | ✅ DONE |
| [services/aiCustomerSupport.ts](services/aiCustomerSupport.ts)   | Add bot detection         | ✅ DONE |
| `services/socketManager.ts`                                      | Deprecate/Remove          | ⏳ TODO |
| `features/call/GroupCallScreen.tsx`                              | Integrate LiveKit         | ⏳ TODO |
| `BE/src/group-call/`                                             | Create new module         | ⏳ TODO |

---

## 📊 RECOMMENDATIONS

1. **Ngắn hạn (1-2 ngày):**
   - Fix WebSocket event names để chat hoạt động
   - Fix call signal structure để 1-1 call hoạt động
   - Test end-to-end flow

2. **Trung hạn (1 tuần):**
   - Consolidate socket services
   - Implement AI chat routing
   - Add network quality monitoring

3. **Dài hạn (2-4 tuần):**
   - Integrate LiveKit for group calls
   - Create group call backend
   - Add call recording feature

---

_Report generated: 2025-01-24_
