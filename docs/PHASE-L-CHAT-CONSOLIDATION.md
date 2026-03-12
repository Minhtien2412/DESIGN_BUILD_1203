# Phase L — Chat Architecture Consolidation

**Date:** 2026-03-10  
**Status:** L1 Audit COMPLETE | L2 Proposal COMPLETE | L3 Migration IN-PROGRESS | L4 Pending

---

## L1 — Current Chat Service Fragmentation Audit

### Inventory: 22 Chat-Related Services

#### REST API Layer (6 services — 3 overlapping)

| Service                                 | Endpoints                                           | Uses `apiFetch`?           | Importers     | Verdict                                                  |
| --------------------------------------- | --------------------------------------------------- | -------------------------- | ------------- | -------------------------------------------------------- |
| `services/api/conversations.service.ts` | `/conversations/*`, `/conversations/:id/messages/*` | ✅ `get/post/patch/del`    | 3             | **CANONICAL** — Best typed, cursor pagination, full CRUD |
| `services/api/messagesApi.ts`           | `/chat/rooms`, `/conversation-messages/*`           | ❌ raw fetch               | 7             | **MIGRATE** — Overlaps chatApi + conversations           |
| `services/api/chatApi.ts`               | `/chat/rooms/*`, `/chat/messages`                   | ❌ raw fetch + manual auth | 1 direct      | **DEPRECATE** — Legacy `/chat` routes                    |
| `services/api/chat.service.ts`          | `/chat/rooms/*`, `/chat/messages`                   | ❌ via `apiClient` wrapper | 1 (re-export) | **DELETE** — Wrapper of chatApi, no direct users         |
| `services/api/communication.service.ts` | `/channels`, `/messages`, `/meetings`, `/calls`     | ✅ partial                 | 11            | **KEEP** — Broader scope (calls/meetings), not pure chat |
| `services/message.service.ts`           | `/messages/conversations`, `/messages/:id/read`     | ❌ raw fetch               | **0**         | **DELETE** — Dead code, zero importers                   |

#### Adapter/Converter Layer (3 services)

| Service                            | Function                                                    | Importers | Verdict                                                              |
| ---------------------------------- | ----------------------------------------------------------- | --------- | -------------------------------------------------------------------- |
| `services/chatAPIService.ts`       | Bridges chatApi + chat.service → ChatRoom/ChatMessage types | 4         | **MIGRATE** — Callers should use conversations.service directly      |
| `services/unifiedChatService.ts`   | Converts chatApi data → UnifiedMessage + AsyncStorage cache | 1         | **MIGRATE** — Cache logic moves to conversation hook                 |
| `services/chatDeltaSyncService.ts` | Watermark-based delta sync protocol                         | active    | **KEEP** — Unique sync capability, refactor to use conversations API |

#### WebSocket Layer (6 services — 3 overlapping)

| Service                                        | Namespace         | Event Format                                                      | Importers                | Verdict                                                             |
| ---------------------------------------------- | ----------------- | ----------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------- |
| `services/conversations-socket.service.ts`     | `/conversations`  | `message.new`, `read.receipt`, `typing`                           | 2                        | **CANONICAL** — Matches BE conversations gateway                    |
| `services/realtime-messaging.service.ts`       | `/conversations`  | `message.new`, `read.receipt`, `typing.update`, `presence.update` | 3                        | **MERGE** into conversations-socket or keep as EventEmitter adapter |
| `services/ChatService.ts`                      | `/chat`           | `message`, `message:read`, `typing`                               | 5                        | **DEPRECATE** — Legacy `/chat` namespace                            |
| `services/chatRealtime.ts`                     | via socketManager | `sendMessage`, `typing:start/stop`                                | 1                        | **DEPRECATE** — Uses old socketManager                              |
| `services/communication/chatSocket.service.ts` | `/chat`           | typing/reactions/read                                             | part of communication.ts | **KEEP** — Part of broader communication hub                        |
| `services/websocket/message-socket.ts`         | custom            | `MessageEventType`                                                | unclear                  | **AUDIT** — May be dead                                             |

#### Context Providers (4 providers)

| Provider                              | Responsibilities                             | Verdict                                   |
| ------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| `context/ChatContext.tsx`             | Conversations list, messages, typing, unread | **CANONICAL** — Primary chat state        |
| `context/MessageContext.tsx`          | Message state + WebSocket integration        | **MERGE** into ChatContext                |
| `context/MessagingContext.tsx`        | Connection state, presence, badge sync       | **KEEP** — Connection/presence layer only |
| `context/CommunicationHubContext.tsx` | Unified messaging/calls/video via Socket.IO  | **KEEP** — Broader scope                  |

#### Hooks (7 hooks — 3 overlapping)

| Hook                                | Source Service            | Importers   | Verdict                                 |
| ----------------------------------- | ------------------------- | ----------- | --------------------------------------- |
| `hooks/useMessages.ts`              | messagesApi               | screens     | **MIGRATE** — Use conversations.service |
| `hooks/use-chat.ts`                 | ChatService (socket)      | components  | **MIGRATE** — Use conversations-socket  |
| `hooks/use-conversations-socket.ts` | conversations-socket      | components  | **CANONICAL**                           |
| `hooks/use-message-attachments.ts`  | uploadService             | components  | **KEEP** — Upload-specific              |
| `hooks/useChatArchive.ts`           | chatHistoryArchiveService | screens     | **KEEP** — Archive-specific             |
| `hooks/useCommunication.ts`         | communication.service     | screens     | **KEEP** — Broader scope                |
| `hooks/crm/useUnifiedMessaging.ts`  | unifiedChatService        | CRM screens | **MIGRATE** — Use conversations.service |

---

### Overlap Analysis

```
┌── CANONICAL LAYER (Keep & Extend) ──────────────────────────┐
│                                                              │
│  REST:   conversations.service.ts                            │
│          └─ /conversations, /conversations/:id/messages      │
│                                                              │
│  Socket: conversations-socket.service.ts                     │
│          └─ namespace: /conversations                        │
│          └─ events: message.new, read.receipt, typing        │
│                                                              │
│  State:  ChatContext.tsx                                      │
│          └─ conversations, messages, typing, unread           │
│                                                              │
│  Hook:   use-conversations-socket.ts                         │
│          └─ WebSocket state for conversations                │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌── DEPRECATE (Phase out over 2 sprints) ─────────────────────┐
│                                                              │
│  REST:   chatApi.ts, chat.service.ts, messagesApi.ts         │
│          └─ Legacy /chat/rooms, /conversation-messages       │
│                                                              │
│  Socket: ChatService.ts, chatRealtime.ts                     │
│          └─ Legacy /chat namespace                           │
│                                                              │
│  Adapt:  chatAPIService.ts, unifiedChatService.ts            │
│          └─ Type converters bridging old→new                 │
│                                                              │
│  Hook:   useMessages.ts, use-chat.ts                         │
│          └─ Using legacy services                            │
│                                                              │
│  Dead:   message.service.ts (0 importers)                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌── KEEP (Different domain / unique capability) ──────────────┐
│                                                              │
│  communication.service.ts  (calls + meetings + channels)     │
│  chatDeltaSyncService.ts   (offline delta sync protocol)     │
│  chatHistoryArchiveService.ts  (local archive management)    │
│  badge.service.ts          (messaging badge counts)          │
│  chatGPTService.ts         (OpenAI integration)              │
│  welcome-message.ts        (onboarding utility)              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## L2 — Canonical Chat Service Architecture

### Target Architecture

```
┌─ REST API ─────────────────────────────────────────────────┐
│  conversations.service.ts (CANONICAL — already exists)      │
│  ├─ createOrGetDirectConversation(targetUserId)             │
│  ├─ createGroupConversation(dto)                            │
│  ├─ getConversations(query)                                 │
│  ├─ getConversation(id)                                     │
│  ├─ addParticipants(id, userIds)                            │
│  ├─ removeParticipant(id, userId)                           │
│  ├─ leaveConversation(id)                                   │
│  ├─ markAsRead(id, messageId?)                              │
│  ├─ sendMessage(id, dto)                                    │
│  ├─ getMessages(id, query)                                  │
│  ├─ getMessage(id, messageId)                               │
│  ├─ updateMessage(id, messageId, content)                   │
│  ├─ deleteMessage(id, messageId, forEveryone?)              │
│  ├─ addReaction(id, messageId, emoji)                       │
│  ├─ removeReaction(id, messageId, emoji)                    │
│  └─ searchMessages(id, query, limit?)                       │
└────────────────────────────────────────────────────────────┘

┌─ WebSocket ────────────────────────────────────────────────┐
│  conversations-socket.service.ts (CANONICAL)                │
│  ├─ connect() / disconnect()                                │
│  ├─ joinConversation(id) / leaveConversation(id)            │
│  ├─ sendMessage(conversationId, content, type?)             │
│  ├─ startTyping(conversationId) / stopTyping(conversationId)│
│  ├─ markRead(conversationId, messageId)                     │
│  └─ Events: message.new, message.updated, message.deleted,  │
│             read.receipt, typing, presence                   │
└────────────────────────────────────────────────────────────┘

┌─ State Management ─────────────────────────────────────────┐
│  ChatContext.tsx (CANONICAL — consolidate MessageContext)    │
│  ├─ conversations: Conversation[]                           │
│  ├─ activeConversation: Conversation | null                 │
│  ├─ messages: Map<conversationId, Message[]>                │
│  ├─ typingUsers: Map<conversationId, number[]>              │
│  ├─ unreadCounts: Map<conversationId, number>               │
│  ├─ connectionStatus: 'connected' | 'reconnecting' | 'offline'│
│  └─ Actions: sendMessage, markRead, loadMore, refresh       │
└────────────────────────────────────────────────────────────┘

┌─ Support Services (Keep) ──────────────────────────────────┐
│  chatDeltaSyncService.ts   → refactor to use conversations API│
│  chatHistoryArchiveService.ts → local device archive         │
│  badge.service.ts          → messaging badge counts          │
│  communication.service.ts  → calls/meetings/channels         │
└────────────────────────────────────────────────────────────┘
```

### BE ↔ FE Endpoint Alignment

| Feature            | BE Controller                 | Path                               | FE Canonical Service                                    |
| ------------------ | ----------------------------- | ---------------------------------- | ------------------------------------------------------- |
| List conversations | `conversations.controller.ts` | `GET /conversations`               | `conversations.service.getConversations()`              |
| Get conversation   | `conversations.controller.ts` | `GET /conversations/:id`           | `conversations.service.getConversation()`               |
| Create DM          | `conversations.controller.ts` | `POST /conversations/direct`       | `conversations.service.createOrGetDirectConversation()` |
| Create group       | `conversations.controller.ts` | `POST /conversations/group`        | `conversations.service.createGroupConversation()`       |
| Send message       | `messages.controller.ts`      | `POST /conversations/:id/messages` | `conversations.service.sendMessage()`                   |
| Get messages       | `messages.controller.ts`      | `GET /conversations/:id/messages`  | `conversations.service.getMessages()`                   |
| Mark read          | `conversations.controller.ts` | `POST /conversations/:id/read`     | `conversations.service.markAsRead()`                    |
| Search             | `search.controller.ts`        | `GET /messages/search`             | `conversations.service.searchMessages()`                |
| WebSocket          | `conversations.gateway.ts`    | namespace `/conversations`         | `conversations-socket.service.ts`                       |

---

## L3 — Migration Plan

### Phase L3a: Delete Dead Code (Safe, immediate)

| File                           | Reason                                     | Risk     |
| ------------------------------ | ------------------------------------------ | -------- |
| `services/message.service.ts`  | 0 importers, dead code                     | Zero     |
| `services/api/chat.service.ts` | 1 re-export in features/chat/index.ts only | Very low |

### Phase L3b: Migrate High-Importer Services (7 importers)

**`services/api/messagesApi.ts`** → Most imported legacy service

Current importers:

1. `app/(tabs)/messages/index.tsx` — conversation list
2. `app/messages/[userId].tsx` — message thread
3. `hooks/useMessages.ts` — message fetching hook
4. Several other message-related screens

Migration strategy:

- Keep `messagesApi.ts` as thin re-export shim initially
- Move callers one by one to `conversations.service.ts`
- Each screen migration is isolated: change import, adjust types

### Phase L3c: Migrate Socket Services

**`services/ChatService.ts`** (5 importers) → `conversations-socket.service.ts`

- `use-chat.ts` → refactor to use `use-conversations-socket.ts`
- `chatAPIService.ts` → thin compat shim until all callers migrated
- Type exports (ChatRoom, ChatMessage) → re-export from conversations.service

### Phase L3d: Merge MessageContext into ChatContext

- Move MessageContext WebSocket bindings into ChatContext
- Update provider chain in `_layout.tsx`

---

## L3 Implementation Status

### Phase L3a — Dead Code Deletion ✅ COMPLETE

| File                           | Action                                            | Date      |
| ------------------------------ | ------------------------------------------------- | --------- |
| `services/message.service.ts`  | **DELETED** — 0 importers                         | Session 3 |
| `services/api/chat.service.ts` | **DELETED** — 0 FE importers after barrel cleanup | Session 3 |
| `services/api/chatApi.ts`      | **DELETED** — 0 FE importers after migration      | Session 3 |

Barrel files updated:

- `services/api/index.ts` — Removed `chatService`/`chat` exports
- `services/index.ts` — Removed `chatService` export
- `features/chat/index.ts` — Redirected to `conversations.service.ts` types

### Phase L3b — REST Service Migration ✅ COMPLETE

| File                                     | Change                                                                                               | Errors |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| `services/chatAPIService.ts`             | Rewired from `chat.service.ts` → `conversations.service.ts`. Same external API, canonical internals. | 0      |
| `services/api/messagesApi.ts`            | Full rewrite: all raw `fetch()` → `conversations.service.ts` delegation. Same exported shapes.       | 0      |
| `services/unifiedChatService.ts`         | All methods migrated from `chatApi` → `conversationsApi`. addMembers/removeMembers now functional.   | 0      |
| `features/chat/ModernMessagesScreen.tsx` | Import changed from `chatApi` → `conversationsApi`                                                   | 0      |

### Phase L3c — Socket Migration 📋 AUDITED, DEFERRED

**Reason for deferral:** Socket services use different event naming conventions and namespaces between legacy (`/chat`, events: `message`, `message:read`) and canonical (`/conversations`, events: `message.new`, `read.receipt`). Rewiring internals risks silent message delivery failures. Requires runtime testing with live WebSocket connections.

**Socket Inventory (9 services):**

| Service                               | Namespace                 | Importers                                                          | Status                                              |
| ------------------------------------- | ------------------------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| `conversations-socket.service.ts`     | `/conversations`          | 3 (use-conversations-socket, use-read-receipts, ChatRoomContainer) | **CANONICAL** ✅                                    |
| `ChatService.ts`                      | `/chat`                   | 5 (use-chat, chat screens, chatAPIService types)                   | **LEGACY** — Migrate when runtime testing available |
| `chatRealtime.ts`                     | via socketManager `/chat` | 1 (useUnifiedMessaging.refactored)                                 | **WRAPPER** — Replace with conversations-socket     |
| `communication/chatSocket.service.ts` | `/chat`                   | 2 (useRealtimeChat, features barrel)                               | **TYPED DUPLICATE** — Consolidate                   |
| `websocket/socketManager.ts`          | Multi-namespace hub       | Many                                                               | **KEEP** — Central manager                          |
| `socketManager.ts`                    | Multi-namespace hub       | 3                                                                  | **KEEP** — UnifiedSocketManager variant             |
| `socket.ts`                           | `/chat`                   | 6 (contexts, hooks)                                                | **KEEP** — Active consumers                         |
| `src/services/socket.ts`              | Configurable              | 3                                                                  | **KEEP** — Architecture layer                       |
| `websocket/message-socket.ts`         | `/messages` raw WS        | TBD                                                                | **AUDIT** — May be dead                             |

**Future migration plan:**

1. Add event-name translation layer in `ChatService.ts` → conversations-socket.service.ts
2. Migrate `use-chat.ts` → `use-conversations-socket.ts`
3. Migrate `chatRealtime.ts` consumers → conversations-socket.service.ts
4. Verify with live WebSocket testing before removing legacy namespace support

### Phase L3d — Adapter Layer Cleanup ✅ COMPLETE

All adapter services now delegate to canonical `conversations.service.ts`:

- `chatAPIService.ts` → canonical (6 callers automatically benefit)
- `messagesApi.ts` → canonical (6 callers automatically benefit)
- `unifiedChatService.ts` → canonical (1 caller automatically benefits)
- `features/chat/index.ts` → re-exports canonical types

---

## L4 — Verification Plan

### Smoke Tests (Post-Migration)

| Test              | Endpoint/Action                            | Expected Result                        |
| ----------------- | ------------------------------------------ | -------------------------------------- |
| Conversation list | `GET /conversations?limit=10`              | Returns paginated conversations        |
| Message thread    | `GET /conversations/:id/messages?limit=20` | Returns messages with cursor           |
| Send message      | `POST /conversations/:id/messages`         | Returns new message with ID            |
| Mark read         | `POST /conversations/:id/read`             | Returns `{ success: true, readCount }` |
| Search messages   | `GET /messages/search?q=test`              | Returns matching messages              |
| WebSocket connect | Connect to `/conversations` with JWT       | Connected event                        |
| Typing indicator  | Emit `typing.start`                        | Other participants see typing          |
| Unread count      | After markRead                             | Badge count decreases                  |

### Runtime Verification (After Each Migration Step)

1. Open conversations tab → list loads correctly
2. Tap conversation → messages load with scroll
3. Send text message → appears in thread
4. Send attachment → upload + delivery
5. Back to list → unread count updated
6. Open different conversation → mark read fires
7. Check badge → total unread correct

---

## Summary: Migration Priority

| Priority | Action                                                      | Files Affected | Risk             |
| -------- | ----------------------------------------------------------- | -------------- | ---------------- |
| **P0**   | Delete `message.service.ts` (dead code)                     | 1 file         | Zero             |
| **P0**   | Delete `chat.service.ts` + clean re-exports                 | 4 files        | Very low         |
| **P1**   | Migrate `messagesApi.ts` callers → conversations.service    | 7+ files       | Medium (gradual) |
| **P1**   | Migrate `chatAPIService.ts` callers → conversations.service | 4 files        | Medium           |
| **P2**   | Migrate ChatService socket → conversations-socket           | 5 files        | Medium           |
| **P2**   | Merge MessageContext into ChatContext                       | 2 files        | Medium           |
| **P3**   | Refactor chatDeltaSyncService to use conversations API      | 1 file         | Low              |
| **P3**   | Clean up adapter layer (unifiedChatService)                 | 2 files        | Low              |
