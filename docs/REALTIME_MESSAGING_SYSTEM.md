# Hệ Thống Nhắn Tin Thời Gian Thực

## Tổng Quan Kiến Trúc

Hệ thống nhắn tin được thiết kế với các tính năng:

- ✅ **Chat 1-1 (DIRECT)** và **Nhóm (GROUP)**
- ✅ **WebSocket realtime** với REST API backup
- ✅ **Message states**: sent → delivered → read
- ✅ **Idempotency** với `clientMessageId`
- ✅ **Multi-device sync**
- ✅ **Cursor-based pagination**
- ✅ **Typing indicators**
- ✅ **Presence tracking** (online/offline)
- ✅ **Read receipts**
- ✅ **Reactions** (emoji)
- ✅ **Welcome Message** - Tin nhắn chào mừng tự động khi đăng ký
- ✅ **CSKH Chat** - Chat trực tiếp với ADMIN DESIGN BUILD

## 🎉 Welcome Message Feature

Khi user đăng ký tài khoản mới, hệ thống sẽ tự động:

1. Tạo conversation DIRECT giữa user mới và ADMIN DESIGN BUILD
2. Gửi tin nhắn chào mừng cá nhân hóa với hướng dẫn sử dụng app
3. Cung cấp đường dẫn CSKH để user có thể trao đổi trực tiếp

### Sử dụng

```typescript
// Tự động được gọi khi register/googleLogin thành công
// Trong auth.service.ts
this.welcomeMessageService.sendWelcomeMessage(user.id, user.name);
```

### CSKH Screen

User có thể truy cập CSKH tại: `/customer-support`

```typescript
// Điều hướng đến CSKH
router.push("/customer-support");
```

## Cấu Trúc Backend (NestJS)

```
BE-baotienweb.cloud/
├── prisma/
│   └── schema-messaging.prisma     # Data models
│
├── src/
│   ├── conversations/              # Conversation management
│   │   ├── conversations.module.ts
│   │   ├── conversations.service.ts
│   │   ├── conversations.controller.ts
│   │   ├── welcome-message.service.ts  # 🆕 Welcome message
│   │   └── dto/
│   │       └── index.ts
│   │
│   ├── conversation-messages/      # Message management
│   │   ├── conversation-messages.module.ts
│   │   ├── messages.service.ts
│   │   ├── messages.controller.ts
│   │   └── dto/
│   │       └── index.ts
│   │
│   └── realtime/                   # WebSocket Gateway
│       ├── realtime.module.ts
│       ├── realtime-messaging.gateway.ts
│       ├── presence.service.ts
│       └── dto/
│           └── realtime.dto.ts
```

## Data Models (Prisma)

### Conversation

```prisma
model Conversation {
  id                String    @id @default(uuid())
  type              ConversationType  // DIRECT | GROUP
  directKey         String?   @unique  // SHA256(sorted userIds) for 1-1
  name              String?            // Group name
  avatar            String?            // Group avatar
  lastMessageId     String?
  lastMessageAt     DateTime?
  lastMessagePreview String?
  version           Int       @default(1)
  participants      ConversationParticipant[]
  messages          ConversationMessage[]
}
```

### ConversationParticipant

```prisma
model ConversationParticipant {
  id                String    @id @default(uuid())
  conversationId    String
  userId            Int
  role              ParticipantRole  // OWNER | ADMIN | MEMBER
  lastReadMessageId String?
  lastReadSeq       Int       @default(0)
  unreadCount       Int       @default(0)
  muted             Boolean   @default(false)
  muteUntil         DateTime?
  leftAt            DateTime?
  removedAt         DateTime?
  removedBy         Int?

  @@unique([conversationId, userId])
}
```

### ConversationMessage

```prisma
model ConversationMessage {
  id                String    @id @default(uuid())
  conversationId    String
  senderId          Int
  clientMessageId   String    // For idempotency
  seq               Int                // Ordering within conversation
  type              MessageType        // TEXT, IMAGE, VIDEO, etc.
  content           String?
  attachments       Json?
  replyToMessageId  String?
  editedAt          DateTime?
  deletedAt         DateTime?

  @@unique([conversationId, clientMessageId])
  @@index([conversationId, seq])
}
```

## REST API Endpoints

### Conversations

| Method | Endpoint                                  | Description             |
| ------ | ----------------------------------------- | ----------------------- |
| POST   | `/conversations/direct`                   | Tạo/lấy chat 1-1        |
| POST   | `/conversations/group`                    | Tạo nhóm mới            |
| GET    | `/conversations`                          | Danh sách conversations |
| GET    | `/conversations/:id`                      | Chi tiết conversation   |
| POST   | `/conversations/:id/participants`         | Thêm thành viên         |
| DELETE | `/conversations/:id/participants/:userId` | Xóa thành viên          |
| POST   | `/conversations/:id/leave`                | Rời nhóm                |
| POST   | `/conversations/:id/read`                 | Đánh dấu đã đọc         |

### Messages

| Method | Endpoint                                              | Description            |
| ------ | ----------------------------------------------------- | ---------------------- |
| POST   | `/conversations/:id/messages`                         | Gửi tin nhắn           |
| GET    | `/conversations/:id/messages`                         | Lấy danh sách tin nhắn |
| GET    | `/conversations/:id/messages/:msgId`                  | Chi tiết tin nhắn      |
| PATCH  | `/conversations/:id/messages/:msgId`                  | Sửa tin nhắn           |
| DELETE | `/conversations/:id/messages/:msgId`                  | Xóa tin nhắn           |
| POST   | `/conversations/:id/messages/:msgId/reactions`        | Thêm reaction          |
| DELETE | `/conversations/:id/messages/:msgId/reactions/:emoji` | Xóa reaction           |

## WebSocket Events

### Namespace: `/messaging`

### Client → Server

| Event               | Payload                                                                               | Description         |
| ------------------- | ------------------------------------------------------------------------------------- | ------------------- |
| `message.send`      | `{ conversationId, clientMessageId, type, content, attachments?, replyToMessageId? }` | Gửi tin nhắn        |
| `message.read`      | `{ conversationId, lastReadSeq }`                                                     | Đánh dấu đã đọc     |
| `typing.start`      | `{ conversationId }`                                                                  | Bắt đầu nhập        |
| `typing.stop`       | `{ conversationId }`                                                                  | Dừng nhập           |
| `presence.update`   | `{ status }`                                                                          | Cập nhật trạng thái |
| `conversation.join` | `{ conversationId }`                                                                  | Join room           |
| `sync.request`      | `{ conversationWatermarks }`                                                          | Sync sau reconnect  |

### Server → Client

| Event              | Payload                                                            | Description       |
| ------------------ | ------------------------------------------------------------------ | ----------------- |
| `message.new`      | `{ messageId, conversationId, seq, senderId, type, content, ... }` | Tin nhắn mới      |
| `message.edited`   | `{ messageId, content, editedAt }`                                 | Tin nhắn được sửa |
| `message.deleted`  | `{ messageId, deletedBy, deleteForAll }`                           | Tin nhắn bị xóa   |
| `message.reaction` | `{ messageId, userId, emoji, action }`                             | Reaction          |
| `read.receipt`     | `{ conversationId, userId, lastReadSeq, lastReadAt }`              | Read receipt      |
| `typing.update`    | `{ conversationId, userId, isTyping, typingUsers }`                | Typing indicator  |
| `presence.update`  | `{ userId, status, lastSeenAt }`                                   | Presence          |

## Cấu Trúc Frontend (React Native)

```
APP_DESIGN_BUILD05.12.2025/
├── services/
│   └── realtime-messaging.service.ts   # WebSocket service
│
├── hooks/
│   ├── useChat.ts                      # Hook cho chat screen
│   └── useConversations.ts             # Hook cho conversation list
│
└── context/
    └── MessagingContext.tsx            # Global messaging state
```

## Sử Dụng

### 1. Setup Provider

```tsx
// app/_layout.tsx
import { MessagingProvider } from "@/context/MessagingContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <MessagingProvider>
        <Stack />
      </MessagingProvider>
    </AuthProvider>
  );
}
```

### 2. Conversation List Screen

```tsx
import { useConversations } from "@/hooks/useConversations";

function ConversationListScreen() {
  const { conversations, isLoading, loadMore, createDirectConversation } =
    useConversations();

  return (
    <FlatList
      data={conversations}
      onEndReached={loadMore}
      renderItem={({ item }) => (
        <ConversationItem
          conversation={item}
          onPress={() => router.push(`/chat/${item.id}`)}
        />
      )}
    />
  );
}
```

### 3. Chat Screen

```tsx
import { useChat } from "@/hooks/useChat";

function ChatScreen({ conversationId }: { conversationId: string }) {
  const {
    messages,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    loadMoreMessages,
    typingUsers,
  } = useChat(conversationId);

  const handleSend = async (text: string) => {
    const ack = await sendMessage(text);
    if (!ack.success) {
      Alert.alert("Lỗi", ack.error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        inverted
        onEndReached={loadMoreMessages}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />

      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

      <ChatInput
        onSend={handleSend}
        onTyping={startTyping}
        onStopTyping={stopTyping}
      />
    </View>
  );
}
```

### 4. Global Unread Badge

```tsx
import { useMessaging } from "@/context/MessagingContext";

function TabBar() {
  const { totalUnread } = useMessaging();

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Messages"
        options={{
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
        }}
      />
    </Tab.Navigator>
  );
}
```

## Flow Chính

### 1. Gửi Tin Nhắn

```
Client                          Server
   |                               |
   |-- message.send ------------->|
   |   {clientMessageId, ...}     |
   |                               | [Check idempotency]
   |                               | [Persist to DB]
   |                               | [Update conversation]
   |<-- message.ack --------------|
   |   {success, messageId, seq}  |
   |                               |
   |<-- message.new --------------|  [Broadcast to room]
   |   {...payload}               |
```

### 2. Read Receipt

```
Client A                        Server                        Client B
   |                               |                               |
   |-- message.read ------------->|                               |
   |   {conversationId, seq}      |                               |
   |                               | [Update lastReadSeq]          |
   |                               | [Reset unreadCount]           |
   |                               |                               |
   |<-- read.sync ----------------|                               |
   |                               |-- read.receipt ------------->|
   |                               |   {userId, lastReadSeq}      |
```

### 3. Reconnect Sync

```
Client                          Server
   |                               |
   |-- [disconnect] -------------->|
   |                               |
   |   ... time passes ...        |
   |                               |
   |-- [connect] ----------------->|
   |-- sync.request -------------->|
   |   {watermarks: [{convId, lastSeq}]}
   |                               | [Query missed messages]
   |<-- sync.response ------------|
   |   {syncData: [...messages]}  |
```

## Cài Đặt

### Backend

```bash
cd BE-baotienweb.cloud

# Merge schema
cat prisma/schema-messaging.prisma >> prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name add_messaging

# Install dependencies
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# Add modules to app.module.ts
# - ConversationsModule
# - ConversationMessagesModule
# - RealtimeModule
```

### Frontend

```bash
cd APP_DESIGN_BUILD05.12.2025

# Install socket.io-client
npm install socket.io-client eventemitter3

# Add MessagingProvider to app/_layout.tsx
```

## Production Considerations

### Scaling

1. **Redis Adapter** cho Socket.IO để support multiple server instances
2. **Redis** cho presence tracking và sequence counters
3. **Message Queue** (Redis/Kafka) cho fanout to offline users

### Security

1. **JWT validation** trên mọi WebSocket connection
2. **Rate limiting** cho message sending
3. **Input sanitization** cho content
4. **Permission checks** trên mọi operation

### Performance

1. **Batch DB writes** cho large groups (100+ members)
2. **Lazy fanout** với queue cho large groups
3. **Message compression** cho large attachments
4. **Connection pooling** cho database

## Files Đã Tạo

### Backend (NestJS)

1. `BE-baotienweb.cloud/prisma/schema-messaging.prisma`
2. `BE-baotienweb.cloud/src/conversations/conversations.module.ts`
3. `BE-baotienweb.cloud/src/conversations/conversations.service.ts`
4. `BE-baotienweb.cloud/src/conversations/conversations.controller.ts`
5. `BE-baotienweb.cloud/src/conversations/dto/index.ts`
6. `BE-baotienweb.cloud/src/conversation-messages/conversation-messages.module.ts`
7. `BE-baotienweb.cloud/src/conversation-messages/messages.service.ts`
8. `BE-baotienweb.cloud/src/conversation-messages/messages.controller.ts`
9. `BE-baotienweb.cloud/src/conversation-messages/dto/index.ts`
10. `BE-baotienweb.cloud/src/realtime/realtime.module.ts`
11. `BE-baotienweb.cloud/src/realtime/realtime-messaging.gateway.ts`
12. `BE-baotienweb.cloud/src/realtime/presence.service.ts`
13. `BE-baotienweb.cloud/src/realtime/dto/realtime.dto.ts`

### Frontend (React Native)

14. `services/realtime-messaging.service.ts`
15. `hooks/useChat.ts`
16. `hooks/useConversations.ts`
17. `context/MessagingContext.tsx`

---

**Author**: ThietKeResort Team  
**Created**: 2025-01-20  
**Version**: 1.0.0
