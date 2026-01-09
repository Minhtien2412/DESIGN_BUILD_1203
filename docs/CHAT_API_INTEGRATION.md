# Hướng Dẫn Tích Hợp Dữ Liệu Chat Thật Từ Backend

## Tổng Quan

Hệ thống chat đã được cập nhật để tích hợp với backend API thật tại `baotienweb.cloud/api/v1`.

## Các File Đã Tạo/Cập Nhật

### 1. `services/chatAPIService.ts` (MỚI)
Service chính để gọi API backend và chuyển đổi dữ liệu:

```typescript
import { chatAPIService } from '@/services/chatAPIService';

// Lấy danh sách phòng chat
const rooms = await chatAPIService.getChatRooms();

// Lấy tin nhắn trong phòng
const { messages, hasMore } = await chatAPIService.getMessages(chatId, { limit: 50 });

// Gửi tin nhắn
const message = await chatAPIService.sendMessage({
  chatId: '123',
  content: 'Hello!',
  type: 'text',
});

// Thêm reaction
await chatAPIService.addReaction(messageId, '❤️');

// Đánh dấu đã đọc
await chatAPIService.markAsRead(chatId);
```

### 2. `hooks/use-chat.ts` (CẬP NHẬT)
Hook React đã được cập nhật để:
- Tự động load dữ liệu từ API khi khởi tạo
- Fallback về dữ liệu local storage khi offline
- Gửi tin nhắn qua cả API và Socket.IO

```typescript
const {
  isConnected,
  isLoading,
  messages,
  chatRooms,
  typingUsers,
  sendMessage,
  addReaction,
  markAsRead,
  loadMoreMessages,
  refreshChatRooms,
} = useChat({ chatId: '123', autoConnect: true });
```

### 3. `app/chat/index.tsx` (MỚI)
Màn hình danh sách chat với:
- Load danh sách từ API
- Tìm kiếm chat
- Swipe actions (ghim, tắt thông báo, xóa)

### 4. `app/chat/[chatId].tsx` (MỚI)
Màn hình chat chi tiết với:
- Load tin nhắn từ API
- Gửi tin nhắn với attachment
- Reply, reaction, forward
- Typing indicator
- Pull-to-refresh

## API Endpoints Được Sử Dụng

| Endpoint | Method | Mô Tả |
|----------|--------|-------|
| `/channels` | GET | Lấy danh sách kênh chat |
| `/messages` | GET | Lấy tin nhắn (filter by channelId) |
| `/messages` | POST | Gửi tin nhắn mới |
| `/messages/{id}` | PUT | Sửa tin nhắn |
| `/messages/{id}` | DELETE | Xóa tin nhắn |
| `/messages/{id}/reactions` | POST | Thêm reaction |
| `/messages/{id}/reactions` | DELETE | Xóa reaction |
| `/channels/{id}/read` | POST | Đánh dấu đã đọc |
| `/chat/rooms` | GET | Lấy phòng chat (backup API) |

## Cấu Trúc Dữ Liệu

### ChatRoom
```typescript
interface ChatRoom {
  id: string;
  name: string;
  avatar?: string;
  type: 'private' | 'group' | 'channel';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: 'text' | 'image' | 'video' | 'file' | 'audio' | 'location';
  content: string;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
  replyTo?: ReplyMessage;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
}
```

## Sử Dụng

### 1. Điều hướng đến màn hình chat
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Đến danh sách chat
router.push('/chat');

// Đến chat cụ thể
router.push({
  pathname: '/chat/[chatId]',
  params: { chatId: '123', chatName: 'Nhóm ABC' },
});
```

### 2. Sử dụng hook useChat
```typescript
import { useChat } from '@/hooks/use-chat';

function ChatScreen() {
  const {
    messages,
    isLoading,
    sendMessage,
    loadMoreMessages,
  } = useChat({ chatId: '123' });

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <FlatList
      data={messages}
      onEndReached={loadMoreMessages}
      // ...
    />
  );
}
```

### 3. Sử dụng service trực tiếp
```typescript
import { chatAPIService } from '@/services/chatAPIService';

// Tìm kiếm tin nhắn
const results = await chatAPIService.searchMessages('keyword', chatId);

// Thêm thành viên
await chatAPIService.addMember(chatId, userId);
```

## Offline Support

Hệ thống tự động:
1. Cache dữ liệu vào AsyncStorage
2. Load từ cache khi offline
3. Sync khi có mạng trở lại

## Socket.IO Integration

`ChatService.ts` xử lý realtime events:
- Tin nhắn mới
- Typing indicator
- Read receipts
- Reactions

API service được dùng song song để:
- Initial data load
- Persistent operations (send, edit, delete)
- Pagination

## Notes

- Tất cả API calls có error handling + fallback
- Messages được transform từ backend format sang local format
- Hỗ trợ cả 2 API: `communication.service.ts` và `chat.service.ts`
