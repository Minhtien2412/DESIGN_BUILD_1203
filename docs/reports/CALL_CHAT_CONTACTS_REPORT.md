# 📞💬📱 BÁO CÁO HỆ THỐNG GỌI ĐIỆN - NHẮN TIN - DANH BẠ

**Ngày kiểm tra:** 27/01/2026  
**Cập nhật lần cuối:** 27/01/2026 (Friend Activity + UnifiedNotification)  
**Trạng thái tổng thể:** ✅ Hoạt động tốt

---

## 📊 TỔNG QUAN KIẾN TRÚC

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native/Expo)                  │
├─────────────────────────────────────────────────────────────────┤
│  CallContext        │  ChatAPIService     │  UserSearchService   │
│  (WebRTC + Socket)  │  (Socket + REST)    │  (REST + Cache)      │
├─────────────────────────────────────────────────────────────────┤
│                    Socket.IO Namespaces                         │
│  /call (WebRTC)  │  /chat (Messages)  │  /notifications          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS + Prisma)                    │
├─────────────────────────────────────────────────────────────────┤
│  CallGateway        │  ChatGateway        │  UsersController     │
│  CallService        │  ChatService        │  UsersService        │
│  CallController     │  ChatController     │  NotificationsGateway│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      PostgreSQL (Prisma)
```

---

## 📞 HỆ THỐNG GỌI ĐIỆN (Call System)

### Công nghệ sử dụng

| Component       | Technology         | Status |
| --------------- | ------------------ | ------ |
| Frontend        | WebRTC + Socket.IO | ✅ OK  |
| Backend Gateway | `/call` namespace  | ✅ OK  |
| Signaling       | WebSocket events   | ✅ OK  |
| Media           | WebRTC P2P         | ✅ OK  |

### Files chính

- **Frontend:** [context/CallContext.tsx](context/CallContext.tsx) (575 lines)
- **Backend:** `/var/www/baotienweb-api/src/call/call.gateway.ts`

### WebSocket Events

```typescript
// Client → Server
"register"      → { userId: number }
"join_call"     → { roomId: string }
"leave_call"    → { roomId: string }
"call_signal"   → { to: number, signal: any }  // WebRTC SDP/ICE
"accept_call"   → { callId: number }
"reject_call"   → { callId: number }

// Server → Client
"incoming_call" → { callId, caller, callee, roomId, type }
"call_accepted" → { callId, roomId, callee }
"call_rejected" → { callId, callee }
"call_ended"    → { callId, endedBy }
"call_signal"   → { from: number, signal: any }
```

### Call Flow

```
1. Caller calls startCall(calleeId, "video")
2. Backend creates call record + notifies callee via WebSocket
3. Callee receives "incoming_call" event
4. Callee accepts → WebRTC signaling begins
5. SDP offer/answer + ICE candidates exchanged
6. P2P connection established
7. Call ends → "call_ended" broadcast
```

---

## 💬 HỆ THỐNG NHẮN TIN (Chat/Messaging)

### Công nghệ sử dụng

| Component       | Technology        | Status |
| --------------- | ----------------- | ------ |
| Frontend        | Socket.IO + REST  | ✅ OK  |
| Backend Gateway | `/chat` namespace | ✅ OK  |
| Real-time       | WebSocket         | ✅ OK  |
| Persistence     | REST API + Prisma | ✅ OK  |

### Files chính

- **Frontend:**
  - [services/chatAPIService.ts](services/chatAPIService.ts) (796 lines)
  - [services/chatRealtime.ts](services/chatRealtime.ts)
  - [services/api/chat.service.ts](services/api/chat.service.ts)
- **Backend:** `/var/www/baotienweb-api/src/chat/chat.gateway.ts`

### WebSocket Events

```typescript
// Client → Server
"joinRoom"      → { roomId: number, userId: number }
"leaveRoom"     → { roomId: number, userId: number }
"sendMessage"   → { roomId, content, attachments, senderId }
"typing"        → { roomId, userId, isTyping: boolean }
"markAsRead"    → { messageId, userId, roomId }
"getOnlineUsers"
"getTypingUsers" → { roomId }

// Server → Client
"userJoined"    → { userId, roomId, timestamp }
"userLeft"      → { userId, roomId, timestamp }
"newMessage"    → Message object
"userTyping"    → { userId, roomId, isTyping, typingUsers[] }
"messageRead"   → { messageId, userId, readAt }
"userOnline"    → { userId, timestamp }
"userOffline"   → { userId, timestamp }
```

### Chat Features

- ✅ 1-1 Direct messages
- ✅ Group chats (rooms)
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online status
- ✅ File attachments
- ✅ Message reactions
- ✅ Reply to message

---

## 📱 HỆ THỐNG DANH BẠ & TÌM KIẾM (Contacts)

### Công nghệ sử dụng

| Component | Technology        | Status              |
| --------- | ----------------- | ------------------- |
| Frontend  | REST API          | ✅ OK               |
| Backend   | `/api/users`      | ✅ OK               |
| Search    | userSearchService | ⚠️ Need BE endpoint |

### Files chính

- **Frontend:**
  - [services/contactsApi.ts](services/contactsApi.ts) (165 lines)
  - [services/userSearchService.ts](services/userSearchService.ts) (534 lines)
- **Backend:** `/var/www/baotienweb-api/src/users/users.controller.ts`

### API Endpoints hiện có

```
GET  /api/users           → List all users  ✅
GET  /api/users/:id       → Get user by ID  ✅
POST /api/users           → Create user     ✅
PUT  /api/users/:id       → Update user     ✅
DELETE /api/users/:id     → Delete user     ✅

GET  /api/users/search    → Search users    ❌ MISSING
```

### Search Features (Frontend ready, Backend cần thêm)

- ✅ Phone number search (with VN normalization)
- ✅ Email search
- ✅ Name/username search
- ✅ Fuzzy search
- ✅ Search history
- ⚠️ Backend search endpoint cần implement

---

## 🔔 HỆ THỐNG THÔNG BÁO (Notifications)

### Vấn đề đã phát hiện

```
❌ 3 Contexts chồng chéo:
   1. NotificationContext.tsx (WebSocket + REST)
   2. NotificationsContext.tsx (expo-notifications)
   3. PushNotificationContext.tsx (Push)

❌ 2 files cùng export useNotifications():
   - context/NotificationContext.tsx
   - context/NotificationsContext.tsx
```

### Giải pháp: UnifiedNotificationContext ✅ ĐÃ TẠO

File mới: [context/UnifiedNotificationContext.tsx](context/UnifiedNotificationContext.tsx)

Features hợp nhất:

- ✅ WebSocket real-time (namespace `/notifications`)
- ✅ REST API fallback
- ✅ Push notifications (expo-notifications)
- ✅ Badge management
- ✅ Notification caching
- ✅ Multi-device support

### Migration Guide

```tsx
// BEFORE (3 imports cũ)
import { useNotifications } from "@/context/NotificationContext";
import { useNotifications } from "@/context/NotificationsContext";
import { usePushNotifications } from "@/context/PushNotificationContext";

// AFTER (1 import mới)
import { useUnifiedNotificationContext } from "@/context/UnifiedNotificationContext";
```

---

## 🛠️ KHUYẾN NGHỊ CẢI THIỆN

### 1. Backend: Thêm User Search Endpoint

```typescript
// users.controller.ts
@Get('search')
@ApiOperation({ summary: 'Search users' })
async search(
  @Query('q') query: string,
  @Query('type') type: 'all' | 'phone' | 'email' | 'name' = 'all',
  @Query('limit') limit = 20,
) {
  return this.usersService.search(query, type, limit);
}
```

### 2. Frontend: Sử dụng UnifiedNotificationContext

```tsx
// app/_layout.tsx
import { UnifiedNotificationProvider } from "@/context/UnifiedNotificationContext";

// Thay 3 providers cũ bằng 1 provider mới:
<UnifiedNotificationProvider>{/* ... */}</UnifiedNotificationProvider>;
```

### 3. Tối ưu WebSocket Connection Pooling

```typescript
// Gộp các WebSocket connections vào 1 manager
// Hiện tại có 4 namespaces riêng biệt:
// /call, /chat, /notifications, /progress
// → Có thể gộp thành 1 connection với rooms
```

---

## 📋 CHECKLIST HOÀN THIỆN

| Component       | Status        | Action                          |
| --------------- | ------------- | ------------------------------- |
| Call System     | ✅ OK         | Không cần thay đổi              |
| Chat System     | ✅ OK         | Không cần thay đổi              |
| Contacts API    | ✅ OK         | Thêm search endpoint BE         |
| User Search FE  | ✅ OK         | Đã có userSearchService         |
| User Search BE  | ⚠️ Missing    | Cần implement                   |
| Notification FE | ✅ Refactored | Dùng UnifiedNotificationContext |
| Notification BE | ✅ OK         | Không cần thay đổi              |

---

## 🔗 FILES THAM KHẢO

### Call System

- [context/CallContext.tsx](context/CallContext.tsx)
- [components/call/CallButton.tsx](components/call/CallButton.tsx)
- [components/call/CallHistoryList.tsx](components/call/CallHistoryList.tsx)

### Chat System

- [services/chatAPIService.ts](services/chatAPIService.ts)
- [services/chatRealtime.ts](services/chatRealtime.ts)
- [features/chat/GroupChatScreen.tsx](features/chat/GroupChatScreen.tsx)

### Contacts/Search

- [services/contactsApi.ts](services/contactsApi.ts)
- [services/userSearchService.ts](services/userSearchService.ts)
- [app/(tabs)/contacts.tsx](<app/(tabs)/contacts.tsx>)

### Notifications

- [context/UnifiedNotificationContext.tsx](context/UnifiedNotificationContext.tsx) ✅ UPDATED
- [features/notifications/UnifiedNotificationsScreen.tsx](features/notifications/UnifiedNotificationsScreen.tsx)
- [hooks/useNotifications.ts](hooks/useNotifications.ts)

---

## 🔔 FRIEND ACTIVITY NOTIFICATIONS

### Notification Types

| Type                | Event             | Message                         |
| ------------------- | ----------------- | ------------------------------- |
| `friend_post`       | Bạn bè đăng bài   | "{name} đã đăng bài viết mới"   |
| `friend_livestream` | Bạn bè livestream | "🔴 {name} đang phát trực tiếp" |
| `friend_story`      | Bạn bè đăng story | "{name} đã đăng tin mới"        |
| `friend_reel`       | Bạn bè đăng reel  | "{name} đã đăng video ngắn"     |

### WebSocket Events

```typescript
// Subscribe to friend activities
socket.emit("subscribe_friend_activities", { friendIds: ["1", "2", "3"] });

// Receive events
socket.on("friend_new_post", (data: FriendActivityData) => { ... });
socket.on("friend_start_livestream", (data: FriendActivityData) => { ... });
socket.on("friend_new_story", (data: FriendActivityData) => { ... });
socket.on("friend_new_reel", (data: FriendActivityData) => { ... });
```

### Usage Example

```tsx
import { useUnifiedNotificationContext } from "@/context/UnifiedNotificationContext";

function FriendsScreen() {
  const {
    subscribeFriendActivities,
    unsubscribeFriendActivities,
    setFriendActivityNotificationsEnabled,
    isFriendActivityEnabled,
  } = useUnifiedNotificationContext();

  // Subscribe when viewing friends
  useEffect(() => {
    const friendIds = friends.map((f) => f.id);
    subscribeFriendActivities(friendIds);
    return () => unsubscribeFriendActivities();
  }, [friends]);

  // Toggle notifications
  const toggleNotifs = () => {
    setFriendActivityNotificationsEnabled(!isFriendActivityEnabled);
  };
}
```

---

## ✅ KẾT LUẬN

**Hệ thống gọi điện, nhắn tin, danh bạ hoạt động tốt với kiến trúc:**

1. **WebSocket** cho real-time (calls, chat, notifications, friend activities)
2. **WebRTC** cho video/audio calls (P2P)
3. **REST API** cho CRUD operations
4. **Push Notifications** cho background alerts

**Đã hoàn thành:**

- ✅ Kiểm tra Call System (WebRTC + Socket.IO)
- ✅ Kiểm tra Chat System (Socket.IO + REST)
- ✅ Kiểm tra Contacts API
- ✅ Tạo UnifiedNotificationContext (gộp 3 contexts)
- ✅ Thêm `/api/v1/users/search` endpoint vào backend
- ✅ Migrate sang UnifiedNotificationProvider trong \_layout.tsx
- ✅ Thêm Friend Activity Notifications (posts, livestreams, stories, reels)
- ✅ Tạo báo cáo chi tiết

**Cần backend hỗ trợ (tương lai):**

- ⏳ Backend emit `friend_new_post`, `friend_start_livestream` events
- ⏳ Backend handle `subscribe_friend_activities` event
