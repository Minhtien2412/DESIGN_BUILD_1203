# 📱 CHAT HISTORY ARCHITECTURE - Zalo-Style Implementation

> **Ngày phân tích:** 2025-01-27  
> **Mục tiêu:** Học hỏi cách xử lý của Zalo cho chat history

---

## 🔍 HIỆN TRẠNG HỆ THỐNG

### Các Service Hiện Có

| Service              | File                                                                             | Chức năng                                |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| `chatHistoryService` | [services/chatHistoryService.ts](services/chatHistoryService.ts)                 | Lưu AI chat vào AsyncStorage (local)     |
| `chatRealtime`       | [services/chatRealtime.ts](services/chatRealtime.ts)                             | WebSocket cho chat thời gian thực        |
| `chatApi`            | [services/api/chatApi.ts](services/api/chatApi.ts)                               | REST API cho rooms/messages              |
| `useChat` hook       | [hooks/useChat.ts](hooks/useChat.ts)                                             | React hook với pagination, read receipts |
| `realtimeMessaging`  | [services/realtime-messaging.service.ts](services/realtime-messaging.service.ts) | WebSocket với idempotent messaging       |

### Lưu Trữ Hiện Tại

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Mobile App)                                         │
├─────────────────────────────────────────────────────────────┤
│  AsyncStorage (Local)                                        │
│  ├── @ai_chat_history - AI conversations (max 50)           │
│  └── @chat_messages_{roomId} - Cached messages              │
├─────────────────────────────────────────────────────────────┤
│  REST API (Load History)                                     │
│  └── GET /conversations/{id}/messages?cursor=&limit=50      │
├─────────────────────────────────────────────────────────────┤
│  WebSocket (Real-time)                                       │
│  └── message.new, typing.update, read.receipt               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SERVER (NestJS + PostgreSQL)                                │
├─────────────────────────────────────────────────────────────┤
│  Prisma Models:                                              │
│  ├── ChatRoom (id, name, projectId, members)                │
│  ├── ChatMessage (id, roomId, senderId, content, attachments)│
│  ├── ChatRoomMember (roomId, userId, joinedAt)              │
│  └── MessageReadStatus (messageId, userId, readAt)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 CÁCH ZALO XỬ LÝ CHAT HISTORY

### 1. **Local-First với Sync**

Zalo dùng mô hình **offline-first**:

- Message lưu ngay vào SQLite/Realm local
- Sync với server khi có mạng
- User thấy message tức thì dù offline

### 2. **Cursor-Based Pagination**

- Không dùng `offset` (slow với large dataset)
- Dùng `seq` (sequence number) làm cursor
- Load từ cũ → mới khi scroll up

### 3. **Watermark Sync**

- Mỗi conversation có `lastSeq` (watermark)
- Khi online, so sánh local vs server watermark
- Chỉ sync delta (messages mới)

### 4. **Message State Machine**

```
sending → sent → delivered → read
    ↓
  failed → retry
```

### 5. **Smart Caching**

- Recent conversations: Full cache
- Old conversations: Only metadata
- Media: Lazy load + thumbnail

---

## ✅ ĐÁNH GIÁ HIỆN TẠI

### ✅ Đã Có (Tốt)

| Feature                 | Status | File                            |
| ----------------------- | ------ | ------------------------------- |
| Cursor-based pagination | ✅     | `useChat.ts` line 310           |
| Optimistic updates      | ✅     | `useChat.ts` line 380           |
| Message idempotency     | ✅     | `realtime-messaging.service.ts` |
| Pending queue (offline) | ✅     | `pendingMessages Map`           |
| Read receipts           | ✅     | `markAsRead`, `read.receipt`    |
| Typing indicators       | ✅     | `typing.start/stop`             |
| Sequence numbers (seq)  | ✅     | Message model                   |

### ❌ Thiếu (Cần Cải Tiến)

| Feature                   | Issue                                  | Priority  |
| ------------------------- | -------------------------------------- | --------- |
| **SQLite Local DB**       | AsyncStorage slow với nhiều messages   | 🔴 HIGH   |
| **Full Watermark Sync**   | Chỉ sync khi online, không incremental | 🔴 HIGH   |
| **Media Thumbnail**       | Load full image, không lazy load       | 🟡 MEDIUM |
| **Search trong messages** | Phải load hết vào memory               | 🟡 MEDIUM |
| **Message retry UI**      | Không hiển thị nút retry rõ ràng       | 🟢 LOW    |

---

## 🔧 GIẢI PHÁP CẢI TIẾN

### 1. Thêm SQLite với Expo-SQLite

```typescript
// services/chatLocalDB.ts
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("chat.db");

// Schema
db.execSync(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    seq INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'TEXT',
    status TEXT DEFAULT 'sent',
    created_at INTEGER NOT NULL,
    synced INTEGER DEFAULT 0,
    UNIQUE(conversation_id, seq)
  );
  
  CREATE INDEX IF NOT EXISTS idx_conv_seq ON messages(conversation_id, seq DESC);
  
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    name TEXT,
    last_seq INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    last_message_preview TEXT,
    updated_at INTEGER
  );
`);
```

### 2. Watermark Sync Protocol

```typescript
// services/chatSyncService.ts
interface ConversationWatermark {
  conversationId: string;
  lastSeq: number; // Last known sequence from server
}

class ChatSyncService {
  /**
   * Sync protocol (giống Zalo):
   * 1. Get local watermarks
   * 2. Send to server
   * 3. Server returns only new messages (seq > lastSeq)
   * 4. Merge into local DB
   */
  async syncConversations(): Promise<void> {
    const localWatermarks = await this.getLocalWatermarks();

    const newMessages =
      await realtimeMessaging.syncConversations(localWatermarks);

    for (const msg of newMessages) {
      await this.insertMessage(msg);
      await this.updateWatermark(msg.conversationId, msg.seq);
    }
  }

  private async getLocalWatermarks(): Promise<ConversationWatermark[]> {
    const result = db.getAllSync<{ id: string; last_seq: number }>(
      "SELECT id, last_seq FROM conversations",
    );
    return result.map((r) => ({ conversationId: r.id, lastSeq: r.last_seq }));
  }
}
```

### 3. Smart Message Loading

```typescript
// hooks/useChatWithLocalDB.ts
export function useChatWithLocalDB(conversationId: string) {
  // 1. Load từ SQLite trước (instant)
  const localMessages = useSQLiteQuery(
    `SELECT * FROM messages WHERE conversation_id = ? ORDER BY seq DESC LIMIT 50`,
    [conversationId],
  );

  // 2. Sync với server nếu có mạng
  useEffect(() => {
    if (isOnline) {
      syncNewMessages(conversationId);
    }
  }, [conversationId, isOnline]);

  // 3. Listen WebSocket cho real-time
  useWebSocketMessages(conversationId, (msg) => {
    // Insert vào SQLite + update state
    insertMessageLocal(msg);
    setMessages((prev) => [...prev, msg]);
  });
}
```

---

## 📊 SO SÁNH PERFORMANCE

| Metric                | Hiện tại (AsyncStorage) | Với SQLite         |
| --------------------- | ----------------------- | ------------------ |
| Load 1000 messages    | ~800ms                  | ~50ms              |
| Search trong messages | O(n) in memory          | O(log n) với index |
| Offline support       | Partial                 | Full               |
| Storage size          | Limited                 | Efficient          |
| Incremental sync      | ❌                      | ✅                 |

---

## 🚀 IMPLEMENTATION STEPS

### Phase 1: SQLite Foundation (1-2 ngày)

```bash
npx expo install expo-sqlite
```

- [ ] Tạo `services/chatLocalDB.ts`
- [ ] Migrate schema
- [ ] Wrapper functions cho CRUD

### Phase 2: Sync Protocol (2-3 ngày)

- [ ] Implement watermark tracking
- [ ] Delta sync endpoint (BE)
- [ ] Conflict resolution

### Phase 3: Hook Integration (1 ngày)

- [ ] Update `useChat` để dùng SQLite first
- [ ] Fallback về REST API
- [ ] Real-time merge

### Phase 4: Media Optimization (1-2 ngày)

- [ ] Thumbnail generation
- [ ] Lazy load images
- [ ] Cache management

---

## 📝 WEBSOCKET CHECKLIST

### Các Event Cần Kiểm Tra

| Event               | Frontend  | Backend      | Status  |
| ------------------- | --------- | ------------ | ------- |
| `message.new`       | ✅ Listen | ✅ Emit      | ✅ OK   |
| `message.send`      | ✅ Emit   | ✅ Handle    | ✅ OK   |
| `message.read`      | ✅ Emit   | ✅ Handle    | ✅ OK   |
| `read.receipt`      | ✅ Listen | ✅ Emit      | ✅ OK   |
| `typing.start/stop` | ✅ Emit   | ✅ Broadcast | ✅ OK   |
| `typing.update`     | ✅ Listen | ✅ Emit      | ✅ OK   |
| `sync.request`      | ✅ Emit   | ⚠️ Cần BE    | 🟡 TODO |

### WebSocket URL Config

```typescript
// Frontend: services/realtime-messaging.service.ts
const wsUrl = ENV.API_BASE_URL.replace("/api", "").replace("http", "ws");
// → wss://baotienweb.cloud/messaging

// Backend: src/chat/chat.gateway.ts
@WebSocketGateway({ namespace: '/chat' })
// → wss://baotienweb.cloud/chat
```

**⚠️ LƯU Ý:** Namespace không khớp!

- FE dùng `/messaging`
- BE dùng `/chat`

**FIX:**

```typescript
// realtime-messaging.service.ts - Sửa line 129
this.socket = io(`${wsUrl}/chat`, { ... }); // Đổi từ /messaging → /chat
```

---

## 📋 ACTION ITEMS

1. **Fix namespace mismatch** - `/messaging` vs `/chat` 🔴
2. **Thêm expo-sqlite** cho local storage 🔴
3. **Implement watermark sync** 🟡
4. **Add BE endpoint** cho delta sync 🟡
5. **Test WebSocket connection** end-to-end 🟢

---

_Report: 2025-01-27_
