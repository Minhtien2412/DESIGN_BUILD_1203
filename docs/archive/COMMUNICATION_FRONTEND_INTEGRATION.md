# Communication Services - Frontend Integration

**Updated: 22/12/2025**

## Overview

Các services đã được tích hợp với backend API tại `https://baotienweb.cloud/api/v1`:

| Service | Endpoint | Status |
|---------|----------|--------|
| Call Service | `/call/*` | ✅ Working |
| Chat Rooms | `/chat/rooms/*` | ✅ Working |
| Messages | `/messages/conversations/*` | ✅ Working |
| Video Rooms | `/video/rooms/*` | ✅ Working |
| Livestream | `/video/livestreams/*` | ✅ Working |

## New Services Files

### 1. Call Service (`services/callService.ts`)
```typescript
import { startCall, acceptCall, rejectCall, endCall, getCallHistory } from '@/services/callService';

// Start a video call
const call = await startCall(userId, 'video');

// Accept incoming call
await acceptCall(callId);

// End call
await endCall(roomId);

// Get call history
const history = await getCallHistory(50);
```

### 2. Chat Rooms Service (`services/chatRooms.ts`)
```typescript
import { 
  createChatRoom, 
  getChatRooms, 
  sendChatMessage,
  getDirectChatWithUser 
} from '@/services/chatRooms';

// Create group chat
const room = await createChatRoom({
  name: 'Team Chat',
  type: 'GROUP',
  memberIds: [1, 2, 3]
});

// Get or create direct chat
const directChat = await getDirectChatWithUser(userId);

// Send message
await sendChatMessage(roomId, {
  content: 'Hello!',
  type: 'TEXT'
});
```

### 3. Video/Livestream Service (`services/videoService.ts`)
```typescript
import { 
  createVideoRoom, 
  joinVideoRoom,
  createLiveStream,
  getCurrentLiveStreams 
} from '@/services/videoService';

// Create meeting room
const room = await createVideoRoom({
  name: 'Team Meeting',
  type: 'MEETING',
  maxParticipants: 10
});

// Join room by code
const { room, token } = await joinVideoRoom('ABC123');

// Start livestream
const stream = await createLiveStream({
  title: 'Product Launch',
  description: 'New product showcase'
});

// Get live streams
const liveStreams = await getCurrentLiveStreams();
```

## New Hooks

### 1. useCallHistory
```typescript
import { useCallHistory } from '@/hooks/useCallHistory';

function CallHistoryScreen() {
  const { calls, loading, refresh, error } = useCallHistory(50);
  
  return (
    <FlatList
      data={calls}
      renderItem={({ item }) => (
        <CallItem 
          call={item}
          otherUser={item.displayInfo?.otherUser}
          isOutgoing={item.displayInfo?.isOutgoing}
        />
      )}
    />
  );
}
```

### 2. useChatRooms
```typescript
import { useChatRooms } from '@/hooks/useChatRooms';

function ChatListScreen() {
  const { rooms, loading, refresh, filterByType } = useChatRooms({
    autoRefreshInterval: 30000, // 30 seconds
  });
  
  return (
    <FlatList
      data={rooms}
      renderItem={({ item }) => (
        <RoomItem 
          name={item.displayName}
          lastMessage={item.lastMessagePreview}
          unreadCount={item.unreadCount}
        />
      )}
    />
  );
}
```

### 3. useLiveStreams
```typescript
import { useLiveStreams } from '@/hooks/useLiveStreams';

function LiveListScreen() {
  const { streams, loading, refresh, liveCount } = useLiveStreams({
    liveOnly: true,
    autoRefreshInterval: 30000,
  });
  
  return (
    <>
      <Text>Live Now: {liveCount}</Text>
      <FlatList
        data={streams}
        renderItem={({ item }) => (
          <StreamCard 
            title={item.title}
            viewerCount={item.viewerCountDisplay}
            isLive={item.isLive}
          />
        )}
      />
    </>
  );
}
```

## WebSocket Integration

### Call WebSocket (CallContext)
```typescript
import { useCall } from '@/context/CallContext';

function VideoCallScreen() {
  const { 
    currentCall,
    incomingCall,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    localStream,
    remoteStream 
  } = useCall();
  
  // Handle incoming call
  useEffect(() => {
    if (incomingCall) {
      showIncomingCallUI(incomingCall);
    }
  }, [incomingCall]);
}
```

### WebSocket Endpoints
- **Call Namespace**: `wss://baotienweb.cloud/call`
- **Chat Namespace**: `wss://baotienweb.cloud/chat`
- **Progress Namespace**: `wss://baotienweb.cloud/progress`

## Updated Components

### 1. Call History (`app/call/history.tsx`)
- Now uses `getCallHistory()` from callService
- Displays caller/callee info from nested objects
- Shows formatted duration using `formatCallDuration()`

### 2. Live List (`app/live/index.tsx`)
- Now uses `useLiveStreams` hook
- Auto-refresh every 30 seconds
- Displays viewer count with `viewerCountDisplay`

## API Response Types

### Call
```typescript
interface Call {
  id: number;
  callerId: number;
  calleeId: number;
  roomId: string;
  status: 'pending' | 'active' | 'ended' | 'missed';
  type: 'video' | 'audio';
  duration?: number;
  caller: { id, name, email };
  callee: { id, name, email };
}
```

### ChatRoom
```typescript
interface ChatRoom {
  id: number;
  name: string;
  type: 'DIRECT' | 'GROUP' | 'PROJECT';
  members: ChatMember[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}
```

### LiveStream
```typescript
interface LiveStream {
  id: number;
  title: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  viewerCount: number;
  host: { id, name, email };
}
```

## Testing

### Test Endpoints (PowerShell)
```powershell
# Get auth token
$token = "eyJhbGciOiJIUzI1NiIs..."

# Test call history
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/call/history" `
  -Headers @{ Authorization = "Bearer $token" }

# Test chat rooms
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/chat/rooms" `
  -Headers @{ Authorization = "Bearer $token" }

# Test video rooms
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/video/rooms" `
  -Headers @{ Authorization = "Bearer $token" }
```

## Notes

1. **User ID Type**: AuthContext returns `user.id` as string. Services convert to number internally.

2. **Error Handling**: All services handle 404 gracefully (backend module not available).

3. **Caching**: Messages API has ETag-based caching via AsyncStorage.

4. **Authentication**: All API calls require JWT token (handled automatically by `apiFetch`).
