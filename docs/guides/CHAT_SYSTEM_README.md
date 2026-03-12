# Chat System - Design Build App

## 🚀 Overview

Hệ thống chat real-time với hỗ trợ khách hàng luôn online, tối ưu cho truy vấn số lượng lớn.

## ✅ Hoàn thành

### 1. Support Users System

- **File**: `data/supportUsers.ts`
- **5 nhân viên hỗ trợ** luôn online:
  | ID | Tên | Vai trò | Bộ phận |
  |---|------|--------|---------|
  | 100001 | CSKH Design Build | Tư vấn viên | Chăm sóc khách hàng |
  | 100002 | Hỗ Trợ KH Design Build | Tư vấn viên | Hỗ trợ kỹ thuật |
  | 100003 | Tư Vấn Thiết Kế | Tư vấn viên | Thiết kế |
  | 100004 | Hỗ Trợ Kỹ Thuật | Kỹ thuật viên | Kỹ thuật |
  | 100005 | Kinh Doanh Design Build | Kinh doanh | Kinh doanh |

### 2. Delta Sync Protocol

- **Endpoint**: `POST /chat/sync/delta`
- **Features**:
  - Watermark-based sync (chỉ lấy messages mới)
  - Batch queries (tránh N+1 problem)
  - Database indexes cho fast queries
  - Pagination support

### 3. Backend APIs

```
POST /chat/sync/delta         - Delta sync với watermarks
GET  /chat/sync/full          - Full sync cho new clients
GET  /chat/sync/support-users - Lấy danh sách support users
POST /chat/sync/support-conversation - Tạo/lấy conversation với support
```

### 4. Chat Icons Component

- **File**: `components/chat/ChatIcons.tsx`
- **50+ icons** cho chat UI:
  - Message icons (chat, send, delivered, seen)
  - Call icons (voice, video, end, missed)
  - Status icons (online, offline, busy, away)
  - Attachment icons (image, document, camera, mic)
  - Action icons (delete, archive, pin, mute, search)
  - Reaction icons (emoji, like, thumbs up)
  - Group icons (group chat, add member, leave)

### 5. E2E WebSocket Tests

- **File**: `e2e/chat-websocket.e2e.test.ts`
- **Test suites**:
  - Connection tests (connect, reconnect)
  - Messaging tests (send, receive, attachments)
  - Typing indicator tests
  - Read receipt tests
  - Support user tests
  - Delta sync tests
  - Error handling tests
  - Performance tests

## 📁 Cấu trúc Files

```
data/
  supportUsers.ts              # Support users data

components/chat/
  ChatIcons.tsx                # All chat icons
  SupportChatList.tsx          # Support chat UI
  index.ts                     # Exports

BE-baotienweb.cloud/src/chat/
  dto/
    delta-sync.dto.ts          # Delta sync DTOs
  sync/
    chat-delta-sync.controller.ts
    chat-delta-sync.service.ts
    chat-sync.module.ts

e2e/
  chat-websocket.e2e.test.ts   # E2E tests
```

## 🔧 Sử dụng

### Import Support Users

```typescript
import {
  getSupportUsers,
  isSupportUser,
  SUPPORT_USERS,
} from "@/data/supportUsers";

// Lấy all support users
const users = getSupportUsers();

// Check if user is support
const isSupport = isSupportUser(userId);
```

### Import Chat Icons

```typescript
import {
  ChatIcon,
  SendIcon,
  OnlineStatusIcon,
  VoiceCallIcon,
} from '@/components/chat';

// Sử dụng icon
<ChatIcon size="lg" badge={3} />
<OnlineStatusIcon status="online" />
<SendIcon color="#007AFF" />
```

### Delta Sync Request

```typescript
const response = await fetch("/chat/sync/delta", {
  method: "POST",
  body: JSON.stringify({
    watermarks: [
      { conversationId: "conv1", lastSeq: 100 },
      { conversationId: "conv2", lastSeq: 50 },
    ],
    limit: 100,
  }),
});
```

## 🏃 Run Tests

```bash
# E2E WebSocket tests
npm run test:e2e -- e2e/chat-websocket.e2e.test.ts

# With specific server
TEST_WS_URL=http://localhost:3001 npm run test:e2e
```

## 📊 Database Optimization

### Indexes (Prisma)

```prisma
model ChatMessage {
  @@index([roomId, seq])
  @@index([senderId])
  @@index([createdAt])
}

model ChatRoom {
  @@index([updatedAt])
}
```

### Batch Queries

```typescript
// ❌ N+1 Problem
for (const room of rooms) {
  const messages = await prisma.message.findMany({
    where: { roomId: room.id },
  });
}

// ✅ Batch Query
const messages = await prisma.message.findMany({
  where: { roomId: { in: roomIds } },
});
const grouped = groupBy(messages, "roomId");
```

## 🔜 Next Steps

1. **Admin Dashboard**: UI để admin xem và trả lời messages từ support
2. **Push Notifications**: Notify khi có message mới
3. **Message Search**: Full-text search trong messages
4. **File Upload**: Upload images/documents trong chat
