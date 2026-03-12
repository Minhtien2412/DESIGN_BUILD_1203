# Communication System - BE ↔ FE Sync Guide

## Backend WebSocket Namespaces

### 1. Chat Namespace: `/chat`
**File:** `BE-baotienweb.cloud/src/chat/chat.gateway.ts`

#### Events (Client → Server):
| Event | Data | Description |
|-------|------|-------------|
| `joinRoom` | `{ roomId: number, userId: number }` | Join a chat room |
| `leaveRoom` | `{ roomId: number, userId: number }` | Leave a chat room |
| `sendMessage` | `{ roomId: number, content: string, type?: string }` | Send message |
| `typing` | `{ roomId: number, userId: number }` | Start typing |
| `stopTyping` | `{ roomId: number, userId: number }` | Stop typing |
| `markAsRead` | `{ roomId: number, messageIds: number[] }` | Mark messages read |

#### Events (Server → Client):
| Event | Data | Description |
|-------|------|-------------|
| `userOnline` | `{ userId: number, timestamp: Date }` | User came online |
| `userOffline` | `{ userId: number, timestamp: Date }` | User went offline |
| `userJoined` | `{ userId: number, roomId: number }` | User joined room |
| `userLeft` | `{ userId: number, roomId: number }` | User left room |
| `newMessage` | `{ id, content, senderId, roomId, createdAt }` | New message received |
| `userTyping` | `{ userId: number, roomId: number }` | Someone is typing |
| `userStoppedTyping` | `{ userId: number, roomId: number }` | Stopped typing |
| `messageRead` | `{ messageIds, userId, roomId }` | Messages marked read |

---

### 2. Call Namespace: `/call`
**File:** `BE-baotienweb.cloud/src/call/call.gateway.ts`

#### Events (Client → Server):
| Event | Data | Description |
|-------|------|-------------|
| `register` | `{ userId: number }` | Register socket with userId |
| `join_call` | `{ roomId: string }` | Join a call room |
| `leave_call` | `{ roomId: string }` | Leave a call room |
| `call_signal` | `{ to: number, signal: any }` | WebRTC signaling |
| `accept_call` | `{ callId: number }` | Accept incoming call |
| `reject_call` | `{ callId: number }` | Reject incoming call |

#### Events (Server → Client):
| Event | Data | Description |
|-------|------|-------------|
| `connected` | `{ userId, socketId }` | Connection confirmed |
| `error` | `{ message: string }` | Error occurred |
| `user_joined` | `{ socketId, userId }` | User joined call room |
| `user_left` | `{ socketId, userId }` | User left call room |
| `call_signal` | `{ from: number, signal: any }` | WebRTC signal received |
| `incoming_call` | `{ callId, caller, roomId, type }` | Incoming call notification |
| `call_accepted` | `{ callId, roomId, callee }` | Call was accepted |
| `call_rejected` | `{ callId, callee }` | Call was rejected |
| `call_ended` | `{ callId, reason }` | Call ended |

---

## Backend REST APIs

### Messages API: `/api/messages`
**File:** `BE-baotienweb.cloud/src/messages/messages.controller.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | Get user's conversations |
| GET | `/conversations/:id` | Get messages in conversation |
| POST | `/conversations/:id/messages` | Send message |
| PUT | `/messages/:id/read` | Mark message as read |
| DELETE | `/messages/:id` | Delete message |

### Call API: `/api/calls`
**File:** `BE-baotienweb.cloud/src/call/call.controller.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/initiate` | Initiate a new call |
| POST | `/:id/accept` | Accept a call |
| POST | `/:id/reject` | Reject a call |
| POST | `/:id/end` | End a call |
| GET | `/history` | Get call history |
| GET | `/:id` | Get call details |

---

## Frontend Implementation Status

### Current Files:
- `context/CommunicationHubContext.tsx` - Main hub (needs update)
- `hooks/useCall.ts` - Call hook (OK)
- `services/api/call.service.ts` - Call API (OK)
- `features/chat/` - Chat feature (needs update)
- `features/live/` - Live streaming (needs check)

### Required Changes:

#### 1. CommunicationHubContext.tsx
```typescript
// BEFORE (incorrect):
const socket = socketIOClient(`${WS_URL}/communication`, ...)

// AFTER (correct - separate namespaces):
const chatSocket = socketIOClient(`${WS_URL}/chat`, ...)
const callSocket = socketIOClient(`${WS_URL}/call`, ...)
```

#### 2. Event Names
```typescript
// Chat events - BEFORE → AFTER:
'typing:start' → 'typing'
'typing:stop' → 'stopTyping'
'call:incoming' → Use /call namespace

// Call events - BEFORE → AFTER:
'call:initiate' → Use REST API POST /calls/initiate
'call:accept' → 'accept_call'
'call:reject' → 'reject_call'
```

---

## Connection URLs

```env
# Production
EXPO_PUBLIC_API_URL=https://baotienweb.cloud/api
EXPO_PUBLIC_WS_URL=wss://baotienweb.cloud

# WebSocket Namespaces
Chat: wss://baotienweb.cloud/chat
Call: wss://baotienweb.cloud/call
```

---

## Integration Checklist

- [ ] Update CommunicationHubContext to use correct namespaces
- [ ] Update chat event names to match BE
- [ ] Update call event names to match BE
- [ ] Test chat connection
- [ ] Test call connection
- [ ] Test message sending/receiving
- [ ] Test call initiation/accept/reject
- [ ] Test typing indicators
- [ ] Test online status updates
