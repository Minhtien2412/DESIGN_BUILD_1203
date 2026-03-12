# Real-time Badge & Notification Count System

## Tổng quan

Hệ thống đồng bộ badge count real-time đảm bảo:

1. **Số lượng thông báo chính xác** - Sync từ nhiều nguồn (WebSocket, Local DB, REST API)
2. **Cập nhật real-time** - Nhận updates ngay lập tức qua WebSocket
3. **Offline-first** - Lưu trữ local với SQLite (Zalo-style)

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                    UnifiedBadgeContext                          │
│  (Central state management for all badges)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │   BadgeSyncService  │←──→│   WebSocket Server  │           │
│  │  (Real-time sync)   │    │   /chat, /notifications         │
│  └─────────────────────┘    └─────────────────────┘           │
│          │                                                      │
│          ▼                                                      │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │    ChatLocalDB      │    │    REST API         │           │
│  │  (SQLite offline)   │    │  (Fallback sync)    │           │
│  └─────────────────────┘    └─────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Files chính

### 1. `services/badgeSyncService.ts` (NEW)

Service singleton quản lý real-time badge sync:

- Connect WebSocket `/chat` và `/notifications`
- Listen events: `newMessage`, `notification`, `missedCall`
- Sync với `chatLocalDB` (SQLite)
- Fallback API polling

```typescript
// Usage
import badgeSyncService from "@/services/badgeSyncService";

// Initialize (called by UnifiedBadgeProvider)
await badgeSyncService.initialize(userId);

// Subscribe to updates
const unsubscribe = badgeSyncService.onBadgeUpdate((counts) => {
  console.log("Messages:", counts.messages);
  console.log("Missed calls:", counts.missedCalls);
  console.log("Notifications:", counts.notifications);
});

// Mark conversation read
await badgeSyncService.markConversationRead(conversationId);

// Force sync
await badgeSyncService.forceSync();
```

### 2. `context/UnifiedBadgeContext.tsx` (UPDATED)

- Integrated `BadgeSyncService` for real-time WebSocket updates
- Auto-initialize on user login
- Auto-cleanup on logout
- Reduced polling interval from 2 min → 5 min (WebSocket handles real-time)

### 3. `services/chatLocalDB.ts` (UPDATED)

Added helper function:

```typescript
// Get total unread across all conversations
const totalUnread = await getTotalUnreadCount();
```

### 4. `context/NotificationContext.tsx` (UPDATED)

- Re-enabled WebSocket connection (`ENABLE_NOTIFICATION_WEBSOCKET = true`)
- Works alongside `BadgeSyncService` for redundancy

## WebSocket Events

### Chat Namespace (`/chat`)

| Event               | Direction       | Description             |
| ------------------- | --------------- | ----------------------- |
| `newMessage`        | Server → Client | New message received    |
| `unreadCountUpdate` | Server → Client | Unread count changed    |
| `messagesRead`      | Server → Client | Messages marked as read |
| `markRead`          | Client → Server | Mark conversation read  |

### Notification Namespace (`/notifications`)

| Event              | Direction       | Description              |
| ------------------ | --------------- | ------------------------ |
| `notification`     | Server → Client | New notification         |
| `notification:new` | Server → Client | New notification (alt)   |
| `missedCall`       | Server → Client | Missed call notification |

## Cách hoạt động

### 1. Khởi tạo (User Login)

```
User Login
    │
    ▼
UnifiedBadgeProvider
    │
    ├─► Initialize BadgeSyncService
    │       │
    │       ├─► Init SQLite (chatLocalDB)
    │       ├─► Sync from local DB
    │       ├─► Connect WebSocket /chat
    │       ├─► Connect WebSocket /notifications
    │       └─► Full sync from REST API
    │
    └─► Subscribe to badge updates
```

### 2. Real-time Update (New Message)

```
New Message arrives via WebSocket
    │
    ▼
BadgeSyncService receives 'newMessage' event
    │
    ├─► Increment local message count
    ├─► Update system badge (iOS/Android)
    └─► Notify all subscribers
            │
            ▼
    UnifiedBadgeContext updates state
            │
            ▼
    UI components re-render with new count
```

### 3. Mark as Read

```
User opens conversation
    │
    ▼
Call badgeSyncService.markConversationRead(id)
    │
    ├─► Update SQLite (unread_count = 0)
    ├─► Recalculate total from local
    ├─► Emit 'markRead' to server
    └─► Update system badge
```

## Cài đặt Dependencies

```bash
# Cài expo-sqlite cho local database
npx expo install expo-sqlite
```

## Lưu ý Backend

Backend cần emit các events sau:

### Chat Gateway (`/chat`)

```typescript
// Khi có tin nhắn mới
this.server.to(userId).emit("newMessage", {
  id: message.id,
  roomId: message.roomId,
  senderId: message.senderId,
  content: message.content,
  type: message.type,
  createdAt: message.createdAt,
  sender: { name, avatar },
});

// Khi unread count thay đổi
this.server.to(userId).emit("unreadCountUpdate", {
  conversationId: roomId,
  unreadCount: newCount,
});
```

### Notification Gateway (`/notifications`)

```typescript
// Khi có thông báo mới
this.server.to(userId).emit("notification", {
  id: notification.id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  createdAt: notification.createdAt,
});

// Khi có cuộc gọi nhỡ
this.server.to(userId).emit("missedCall", {
  id: call.id,
  callerId: call.callerId,
  callerName: call.callerName,
  type: "audio" | "video",
});
```

## Testing

```typescript
// Test badge sync
import badgeSyncService from "@/services/badgeSyncService";

// Check connection
console.log("Connected:", badgeSyncService.isConnected);

// Get current counts
console.log("Counts:", badgeSyncService.counts);

// Force sync
await badgeSyncService.forceSync();
```

## Troubleshooting

### Badge không cập nhật real-time

1. Kiểm tra WebSocket connection:
   ```typescript
   console.log("WS Connected:", badgeSyncService.isConnected);
   ```
2. Kiểm tra backend emit đúng event name
3. Kiểm tra ENV.WS_BASE_URL configured

### Unread count không chính xác

1. Gọi `forceSync()` để sync lại từ API
2. Kiểm tra `chatLocalDB` có data không:
   ```typescript
   import { getTotalUnreadCount } from "@/services/chatLocalDB";
   const count = await getTotalUnreadCount();
   ```

### Badge không hiển thị trên app icon

- iOS: Cần permission notification
- Android: Xem BadgeProvider/Notification channel config
