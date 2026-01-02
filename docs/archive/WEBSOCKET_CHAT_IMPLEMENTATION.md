# WebSocket & Chat Implementation

## Overview

Complete WebSocket infrastructure with Socket.IO client and real-time chat interface. Infrastructure ready for backend deployment with graceful fallback when backend is unavailable.

## Architecture

### 1. WebSocket Context
- **File**: `context/WebSocketContext.tsx`
- **Purpose**: Global WebSocket connection manager
- **Features**:
  - Auto-connect when user authenticated
  - Auto-disconnect on logout
  - Reconnection with exponential backoff (max 5 attempts)
  - Connection status monitoring
  - Graceful degradation if backend not ready

### 2. Socket Service
- **File**: `services/socket.ts`
- **Purpose**: Socket.IO client wrapper
- **Features**:
  - Connection management
  - Event emitters and listeners
  - Platform-specific URL normalization (Android/iOS/Web)
  - Token-based authentication

### 3. Chat Interface
- **File**: `app/(tabs)/menu9.tsx`
- **Purpose**: Real-time messaging UI
- **Features**:
  - Room list view
  - Chat room with messages
  - Real-time message delivery
  - Typing indicators
  - Optimistic UI updates
  - Connection status display

## WebSocket Connection Flow

```
App Launch
  ↓
User Authenticated
  ↓
WebSocketProvider.connect()
  ↓
socketManager.connect()
  ↓
Socket.IO Client connects to backend
  ↓
Authentication with token
  ↓
Connection established
  ↓
Subscribe to events (chat:message, chat:typing, etc.)
```

### Graceful Fallback
```
Connection Attempt
  ↓
Backend not ready / Network error
  ↓
Catch error (no throw)
  ↓
Log error + set error state
  ↓
App continues to work (offline mode)
  ↓
User sees "Offline" indicator
  ↓
Can retry manually
```

## WebSocket Events

### Outgoing (Emit)
| Event | Data | Purpose |
|-------|------|---------|
| `chat:join` | `{ roomId }` | Join chat room |
| `chat:leave` | `{ roomId }` | Leave chat room |
| `chat:message` | `{ roomId, content, userId, userName }` | Send message |
| `chat:typing` | `{ roomId, userId, userName }` | Typing indicator |

### Incoming (Listen)
| Event | Data | Purpose |
|-------|------|---------|
| `chat:message` | `{ id, userId, userName, content, createdAt }` | Receive message |
| `chat:typing` | `{ userId, userName }` | User typing |
| `connect` | - | Connection established |
| `disconnect` | - | Connection lost |
| `error` | `{ message }` | Connection error |

## Usage Examples

### 1. Use WebSocket in Component

```typescript
import { useWebSocket } from '@/context/WebSocketContext';

export default function MyComponent() {
  const { socket, connected, connecting, error, connect } = useWebSocket();

  useEffect(() => {
    if (socket && connected) {
      // Listen for events
      socket.on('chat:message', (data) => {
        console.log('New message:', data);
      });

      // Emit events
      socket.emit('chat:join', { roomId: '123' });

      return () => {
        socket.off('chat:message');
        socket.emit('chat:leave', { roomId: '123' });
      };
    }
  }, [socket, connected]);

  if (!connected) {
    return <Text>Connecting...</Text>;
  }

  return <View>...</View>;
}
```

### 2. Send Message

```typescript
const sendMessage = () => {
  if (socket && connected) {
    socket.emit('chat:message', {
      roomId: 'room-123',
      content: 'Hello!',
      userId: user.id,
      userName: user.username,
    });
  }
};
```

### 3. Handle Connection Status

```typescript
const { connected, connecting, error, reconnect } = useWebSocket();

if (connecting) {
  return <ActivityIndicator />;
}

if (error) {
  return (
    <View>
      <Text>Connection error: {error}</Text>
      <Button onPress={reconnect}>Retry</Button>
    </View>
  );
}

if (!connected) {
  return <Text>Offline</Text>;
}

return <Text>Connected</Text>;
```

## Chat Screen Features

### Room List
- Display available chat rooms
- Unread message badges
- Last message preview
- Tap to enter room

### Chat Room
- Real-time message delivery
- Message bubbles (own vs others)
- Sender names
- Timestamps
- Typing indicators
- Connection status indicator
- Keyboard handling (iOS/Android)

### Optimistic UI
- Messages appear instantly when sent
- Background WebSocket sync
- No loading delay for user

## Connection States

| State | Description | UI Indicator |
|-------|-------------|--------------|
| Disconnected | Not connected | Red "Offline" text |
| Connecting | Attempting connection | "Connecting..." text |
| Connected | Active connection | Green dot + "Online" |
| Error | Connection failed | Red "Offline" + retry button |

## Auto-Reconnection

### Exponential Backoff
```
Attempt 1: Wait 1 second
Attempt 2: Wait 2 seconds
Attempt 3: Wait 4 seconds
Attempt 4: Wait 8 seconds
Attempt 5: Wait 16 seconds
Max attempts reached: Give up gracefully
```

### Triggers
- Connection lost
- Network change (offline → online)
- User logs in
- Manual retry button

## Platform Considerations

### Android
- WebSocket URL: Uses device IP for emulator (`10.0.2.2`)
- Keyboard: No offset needed

### iOS
- WebSocket URL: Uses `localhost` for simulator
- Keyboard: 90px vertical offset
- Status bar: 44px top padding for offline indicator

### Web
- WebSocket URL: Uses configured backend URL
- Keyboard: No special handling
- Fixed positioning for indicators

## Backend Integration

### Expected Backend Endpoints

```typescript
// Socket.IO Server (NestJS/Express)
const io = new Server(httpServer, {
  cors: { origin: '*' },
  namespace: '/chat',
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify token
  next();
});

// Room join
socket.on('chat:join', ({ roomId }) => {
  socket.join(roomId);
});

// Message broadcast
socket.on('chat:message', (data) => {
  io.to(data.roomId).emit('chat:message', {
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
  });
});

// Typing indicator
socket.on('chat:typing', (data) => {
  socket.to(data.roomId).emit('chat:typing', data);
});
```

### Expected Backend URL
```
Development: http://localhost:3000
Production: https://api.baotienweb.cloud
Namespace: /chat
```

## Testing WebSocket

### Manual Testing

#### 1. Test Connection
```bash
1. Open app and login
2. Navigate to Menu9 (Chat)
3. Check connection indicator:
   - Green "Online" = Connected
   - Red "Offline" = Not connected
4. Click retry if needed
```

#### 2. Test Room Join
```bash
1. Select a chat room
2. Console should show: "[WebSocket] Joining room: <id>"
3. Mock messages should appear
```

#### 3. Test Sending
```bash
1. Type a message
2. Press send
3. Message should appear instantly (optimistic UI)
4. If connected, WebSocket event emitted
5. If offline, message only local
```

#### 4. Test Reconnection
```bash
1. Turn on Airplane Mode
2. App shows "Offline"
3. Turn off Airplane Mode
4. App should auto-reconnect
5. Check console for reconnection logs
```

### Console Logs
```
[WebSocket] Auto-connecting on mount
[WebSocket] Attempting to connect...
[WebSocket] Connected successfully
[Chat] WebSocket connected, setting up listeners
[Chat] Joining room: general
[Chat] New message received: {...}
[Chat] User typing: {...}
```

## Security Considerations

### Token Authentication
```typescript
// Socket connects with auth token
const socket = io(SOCKET_URL, {
  auth: {
    token: await getAccessToken(),
  },
});

// Backend verifies token
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = await verifyToken(token);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

### Room Authorization
```typescript
// Backend checks user can access room
socket.on('chat:join', async ({ roomId }) => {
  const canAccess = await checkRoomAccess(socket.user.id, roomId);
  if (canAccess) {
    socket.join(roomId);
  } else {
    socket.emit('error', { message: 'Access denied' });
  }
});
```

### Message Validation
```typescript
// Sanitize and validate messages
socket.on('chat:message', (data) => {
  // Validate
  if (!data.content || data.content.length > 500) {
    return socket.emit('error', { message: 'Invalid message' });
  }
  
  // Sanitize
  data.content = sanitizeHtml(data.content);
  
  // Broadcast
  io.to(data.roomId).emit('chat:message', data);
});
```

## Performance Optimizations

### Message Batching
```typescript
// Batch typing indicators (debounce)
const handleTyping = useCallback(
  debounce(() => {
    if (socket && connected) {
      socket.emit('chat:typing', { roomId, userId });
    }
  }, 500),
  [socket, connected, roomId, userId]
);
```

### Message Pagination
```typescript
// Load messages in chunks
const loadMoreMessages = async () => {
  const response = await api.get(`/rooms/${roomId}/messages`, {
    params: { limit: 50, before: oldestMessageId },
  });
  setMessages(prev => [...response.data, ...prev]);
};
```

### Unread Optimization
```typescript
// Mark as read on view
useEffect(() => {
  if (visible && socket && connected) {
    socket.emit('chat:read', { roomId, userId });
  }
}, [visible, socket, connected, roomId, userId]);
```

## Troubleshooting

### Connection Fails
**Symptom**: "Offline" indicator, error in console  
**Solutions**:
1. Check backend is running
2. Verify WebSocket URL in config
3. Check network connectivity
4. Review backend CORS settings
5. Check auth token validity

### Messages Not Received
**Symptom**: Send works but no messages arrive  
**Solutions**:
1. Check event listeners are set up
2. Verify room join/leave logic
3. Check backend is broadcasting correctly
4. Review console for errors

### Reconnection Loop
**Symptom**: Constant connect/disconnect cycles  
**Solutions**:
1. Check auth token expiration
2. Review backend authentication logic
3. Check network stability
4. Increase reconnection delays

### Memory Leaks
**Symptom**: App slows down over time  
**Solutions**:
1. Ensure socket.off() in cleanup
2. Clear event listeners on unmount
3. Limit message history size
4. Implement pagination

## Future Enhancements

### 1. Read Receipts
- Track message read status
- Show checkmarks (sent/delivered/read)
- Real-time read updates

### 2. File Sharing
- Image upload and preview
- File attachments
- Video/audio messages

### 3. Push Notifications
- Background message notifications
- Notification badges
- Sound alerts

### 4. Message Search
- Full-text search
- Filter by user/date
- Search history

### 5. Reactions
- Emoji reactions
- Like/love/etc
- Reaction counts

### 6. Voice/Video Calls
- WebRTC integration
- Call initiation via chat
- Call history

## Related Documentation
- [Offline Mode Implementation](./OFFLINE_MODE_IMPLEMENTATION.md)
- [API Integration](./API_INTEGRATION.md)
- [Caching Implementation](./CACHING_IMPLEMENTATION.md)

## Summary

✅ **WebSocket Infrastructure Complete**:
- WebSocketContext with auto-connect/disconnect
- Graceful fallback when backend unavailable
- Exponential backoff reconnection
- Connection status monitoring

✅ **Chat Interface Complete**:
- Room list with unread badges
- Real-time messaging UI
- Typing indicators
- Optimistic UI updates
- Keyboard handling

✅ **Ready for Backend**:
- Socket.IO events defined
- Authentication flow ready
- Error handling implemented
- Testing procedures documented

🎯 **Status**: Infrastructure 100% complete, waiting for backend WebSocket deployment to enable full real-time features.
