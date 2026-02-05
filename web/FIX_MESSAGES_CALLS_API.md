# Hướng Dẫn Fix Messages & Calls Live API

## ✅ HOÀN THÀNH
### 1. Notification Badge Reset
**File:** `features/notifications/UnifiedNotificationsScreen.tsx`

**Đã fix:**
- ✅ Thêm `useUnifiedBadge()` hook
- ✅ Khi ấn vào notification → `syncWithNotifications(newUnreadCount)` 
- ✅ Khi đánh dấu tất cả đã đọc → `syncWithNotifications(0)`
- ✅ Badge reset ngay lập tức giống Zalo

**Test:** Ấn vào thông báo → số badge phải giảm ngay

---

## 🔄 ĐANG LÀM
### 2. Messages Live API Integration

**Vấn đề hiện tại:**
- File `hooks/crm/useUnifiedMessaging.ts` đang dùng MOCK_DATA
- Đã có `services/api/chatApi.ts` với real API endpoints
- Cần thay thế mock data bằng API calls thật

**API Endpoints có sẵn:**
```typescript
// services/api/chatApi.ts
- createRoom(dto: CreateRoomDto): Promise<ChatRoom>
- getRooms(): Promise<ChatRoom[]>
- getRoom(roomId: number): Promise<ChatRoom>
- getMessages(roomId: number, params?: MessageQueryParams): Promise<ChatMessage[]>
- sendMessage(dto: SendMessageDto): Promise<ChatMessage>
- markAsRead(roomId: number): Promise<void>
- getRoomMembers(roomId: number): Promise<ChatMember[]>
- addMembers(roomId: number, memberIds: number[]): Promise<void>
- removeMember(roomId: number, memberId: number): Promise<void>
```

**Backend Base URL:**
```typescript
BASE_URL = https://baotienweb.cloud/api/v1/chat
```

### Các bước fix:

#### Bước 1: Tạo Chat Service Adapter
Tạo file `services/unifiedChatService.ts` để chuyển đổi data từ chatApi sang format của useUnifiedMessaging:

```typescript
import * as chatApi from './api/chatApi';
import { UnifiedConversation, UnifiedMessage } from '@/hooks/crm/useUnifiedMessaging';

export class UnifiedChatService {
  // Convert ChatRoom -> UnifiedConversation
  static convertRoomToConversation(room: chatApi.ChatRoom): UnifiedConversation {
    return {
      id: room.id.toString(),
      type: room.isGroup ? 'group' : 'direct',
      name: room.name,
      participants: room.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.user.role,
        onlineStatus: 'offline', // TODO: Get from WebSocket
      })),
      lastMessage: room.lastMessage ? this.convertMessage(room.lastMessage) : undefined,
      unreadCount: room.unreadCount,
      isPinned: false, // TODO: Get from user settings
      isMuted: false, // TODO: Get from user settings
      isOnline: false,
      typingUsers: [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  // Convert ChatMessage -> UnifiedMessage
  static convertMessage(msg: chatApi.ChatMessage): UnifiedMessage {
    return {
      id: msg.id.toString(),
      conversationId: msg.roomId.toString(),
      senderId: msg.senderId,
      sender: {
        id: msg.sender.id,
        name: msg.sender.name,
        email: msg.sender.email,
        onlineStatus: 'offline',
      },
      type: msg.type,
      content: msg.content,
      deliveryStatus: msg.isRead ? 'read' : 'delivered',
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    };
  }

  // Fetch conversations from API
  static async getConversations(): Promise<UnifiedConversation[]> {
    try {
      const rooms = await chatApi.getRooms();
      return rooms.map(this.convertRoomToConversation);
    } catch (error) {
      console.error('[UnifiedChatService] Error fetching conversations:', error);
      throw error;
    }
  }

  // Fetch messages for conversation
  static async getMessages(conversationId: string): Promise<UnifiedMessage[]> {
    try {
      const roomId = parseInt(conversationId);
      const messages = await chatApi.getMessages(roomId);
      return messages.map(this.convertMessage);
    } catch (error) {
      console.error('[UnifiedChatService] Error fetching messages:', error);
      throw error;
    }
  }

  // Send message
  static async sendMessage(conversationId: string, content: string): Promise<UnifiedMessage> {
    try {
      const roomId = parseInt(conversationId);
      const message = await chatApi.sendMessage({ roomId, content });
      return this.convertMessage(message);
    } catch (error) {
      console.error('[UnifiedChatService] Error sending message:', error);
      throw error;
    }
  }

  // Mark conversation as read
  static async markAsRead(conversationId: string): Promise<void> {
    try {
      const roomId = parseInt(conversationId);
      await chatApi.markAsRead(roomId);
    } catch (error) {
      console.error('[UnifiedChatService] Error marking as read:', error);
      throw error;
    }
  }
}
```

#### Bước 2: Update useUnifiedMessaging Hook
Thay thế mock data bằng real API trong `hooks/crm/useUnifiedMessaging.ts`:

```typescript
// Thêm import
import { UnifiedChatService } from '@/services/unifiedChatService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function useUnifiedMessaging() {
  const { isOnline } = useNetworkStatus();
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    if (!isOnline) {
      // Load from AsyncStorage cache nếu offline
      const cached = await AsyncStorage.getItem('@conversations');
      if (cached) {
        setConversations(JSON.parse(cached));
      }
      setLoadingConversations(false);
      return;
    }

    try {
      setLoadingConversations(true);
      const data = await UnifiedChatService.getConversations();
      setConversations(data);
      
      // Cache for offline use
      await AsyncStorage.setItem('@conversations', JSON.stringify(data));
    } catch (error) {
      console.error('[useUnifiedMessaging] Load error:', error);
    } finally {
      setLoadingConversations(false);
    }
  }, [isOnline]);

  // Refresh conversations
  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  // Send message
  const sendMessage = useCallback(async (params: SendMessageParams) => {
    try {
      const message = await UnifiedChatService.sendMessage(
        params.conversationId,
        params.content
      );
      
      // Update local state
      setConversations(prev => prev.map(conv => {
        if (conv.id === params.conversationId) {
          return {
            ...conv,
            lastMessage: message,
            updatedAt: message.createdAt,
          };
        }
        return conv;
      }));

      return message;
    } catch (error) {
      console.error('[useUnifiedMessaging] Send error:', error);
      throw error;
    }
  }, []);

  // Mark as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await UnifiedChatService.markAsRead(conversationId);
      
      // Update local state
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      }));

      // Sync with badge context
      if (badgeSyncCallback) {
        const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
        badgeSyncCallback(totalUnread, 0);
      }
    } catch (error) {
      console.error('[useUnifiedMessaging] Mark read error:', error);
    }
  }, [conversations]);

  // Load on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loadingConversations,
    refreshConversations,
    sendMessage,
    markConversationAsRead,
    // ... other exports
  };
}
```

#### Bước 3: Tích hợp WebSocket cho realtime
File `services/chatRealtime.ts` đã có sẵn, cần kết nối:

```typescript
// Trong useUnifiedMessaging hook
useEffect(() => {
  if (!user) return;

  // Connect to WebSocket
  const ws = new WebSocket(`${ENV.WS_BASE_URL}/chat`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'new_message') {
      // Update conversation with new message
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.conversationId) {
          return {
            ...conv,
            lastMessage: data.message,
            unreadCount: conv.unreadCount + 1,
          };
        }
        return conv;
      }));

      // Sync badge
      if (badgeSyncCallback) {
        const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0) + 1;
        badgeSyncCallback(totalUnread, 0);
      }
    }
  };

  return () => ws.close();
}, [user]);
```

---

## 🔄 CẦN LÀM
### 3. Calls Live API Integration

**Vấn đề hiện tại:**
- File `app/call/unified-history.tsx` và `hooks/useCall.ts` đang dùng mock data
- Cần tích hợp với WebRTC/CallKit service

**API Endpoints cần tạo:**
```typescript
// services/api/call.service.ts (CẦN TẠO)
- getCallHistory(): Promise<CallHistoryItem[]>
- initiateCall(userId: number, type: 'audio' | 'video'): Promise<Call>
- endCall(callId: string): Promise<void>
- acceptCall(callId: string): Promise<void>
- rejectCall(callId: string): Promise<void>
```

**Backend endpoints:**
```
POST /calls/initiate
POST /calls/:id/accept
POST /calls/:id/reject
POST /calls/:id/end
GET /calls/history
```

### Các bước fix:

#### Bước 1: Tạo Call API Service
```typescript
// services/api/callService.ts
import { getAuthHeaders } from './chatApi';
import ENV from '@/config/env';

const BASE_URL = `${ENV.API_BASE_URL}/calls`;

export interface CallHistoryItem {
  id: string;
  otherUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  type: 'audio' | 'video';
  status: 'missed' | 'answered' | 'rejected';
  duration: number;
  isOutgoing: boolean;
  createdAt: string;
}

export async function getCallHistory(): Promise<CallHistoryItem[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/history`, { headers });
  if (!response.ok) throw new Error('Failed to fetch call history');
  return response.json();
}

export async function initiateCall(userId: number, type: 'audio' | 'video'): Promise<any> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/initiate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, type }),
  });
  if (!response.ok) throw new Error('Failed to initiate call');
  return response.json();
}
```

#### Bước 2: Update useCall Hook
Thay mock data bằng API calls thật tương tự như messages.

---

## 📋 CHECKLIST

### Notifications
- [x] Import `useUnifiedBadge()` vào UnifiedNotificationsScreen
- [x] Sync badge khi ấn notification item
- [x] Sync badge khi mark all as read
- [x] Test badge reset ngay lập tức

### Messages
- [ ] Tạo `services/unifiedChatService.ts`
- [ ] Update `useUnifiedMessaging` để dùng real API
- [ ] Tích hợp WebSocket realtime
- [ ] Tích hợp cache offline với AsyncStorage
- [ ] Sync với UnifiedBadgeContext khi đọc tin nhắn
- [ ] Test: Gửi tin nhắn → badge tăng
- [ ] Test: Mở chat → badge giảm
- [ ] Test: Nhận tin nhắn mới → badge tăng realtime

### Calls
- [ ] Tạo `services/api/callService.ts`
- [ ] Update `useCall` hook để dùng real API
- [ ] Tích hợp WebRTC cho voice/video calls
- [ ] Tích hợp CallKit cho iOS push notifications
- [ ] Sync với UnifiedBadgeContext cho missed calls
- [ ] Test: Nhận cuộc gọi nhỡ → badge tăng
- [ ] Test: Xem lịch sử cuộc gọi → badge giảm

### Integration Tests
- [ ] Test offline mode với cached data
- [ ] Test reconnect khi online lại
- [ ] Test badge sync giữa notifications + messages + calls
- [ ] Test WebSocket reconnect khi mất kết nối
- [ ] Test performance với nhiều conversations

---

## 🚀 NEXT STEPS

1. **Ngay bây giờ:** Tạo `services/unifiedChatService.ts`
2. **Tiếp theo:** Update `useUnifiedMessaging` hook
3. **Sau đó:** Tích hợp WebSocket realtime
4. **Cuối cùng:** Fix calls API tương tự

## 📝 NOTES

- Backend API URL: `https://baotienweb.cloud/api/v1`
- WebSocket URL: `wss://baotienweb.cloud`
- Authentication: Bearer token từ `@storage/accessToken`
- Offline cache: AsyncStorage với key prefix `@`
- Badge sync: Sử dụng `UnifiedBadgeContext.syncWithMessaging()`

## ⚠️ CẢNH BÁO

- **Mock data hiện tại:** Chỉ dùng trong development, không deploy production với mock data
- **WebSocket:** Cần handle reconnect và error cases
- **Offline mode:** Cache data với timestamp, sync khi online lại
- **Badge count:** Phải sync chính xác để tránh số badge sai
