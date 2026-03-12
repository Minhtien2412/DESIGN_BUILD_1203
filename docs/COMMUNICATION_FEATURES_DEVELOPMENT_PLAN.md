# 📱 Kế Hoạch Phát Triển Tính Năng Giao Tiếp

> **Ngày tạo:** 19/01/2026  
> **Phiên bản:** 1.0  
> **Tác giả:** Development Team

---

## 📋 Tổng Quan

Kế hoạch này chi tiết việc phát triển và hoàn thiện 4 tính năng giao tiếp chính:

| #   | Tính năng                       | Mô tả                          |
| --- | ------------------------------- | ------------------------------ |
| 1   | **Nhắn tin (Messaging)**        | Chat 1-1, nhóm, real-time      |
| 2   | **Gọi điện (Calling)**          | Voice & Video calls            |
| 3   | **Phòng họp online (Meetings)** | Video conferencing nhiều người |
| 4   | **Livestreams**                 | Phát trực tiếp và xem streams  |

---

## 📊 Trạng Thái Hiện Tại

### Phân Tích Chi Tiết

| Tính năng       | Backend        | Frontend       | WebSocket     | Độ hoàn thiện |
| --------------- | -------------- | -------------- | ------------- | ------------- |
| **Messaging**   | ✅ REST + WS   | 🟡 UI có sẵn   | 🟡 Disabled   | **70%**       |
| **Calling**     | ✅ Call module | 🟡 Mock WebRTC | 🟡 Partial    | **50%**       |
| **Meetings**    | 🟡 Scheduled   | 🟡 Mock video  | ❌ No LiveKit | **40%**       |
| **Livestreams** | ✅ Complete    | 🔴 Stub only   | ❌ No RTMP    | **30%**       |

### Files Hiện Có

```
📁 Frontend
├── app/messages/
│   ├── index.tsx (546 lines) ✅
│   ├── [userId].tsx ✅
│   ├── realtime-chat.tsx ✅
│   └── unified.tsx ✅
├── app/call/
│   ├── active.tsx ✅
│   ├── history.tsx ✅
│   └── [userId].tsx ✅
├── app/meet/
│   ├── index.tsx (291 lines) ✅
│   ├── create.tsx ✅
│   ├── join.tsx ✅
│   └── [code].tsx ✅
├── app/live/
│   ├── index.tsx ✅
│   └── [id].tsx ✅
├── context/
│   ├── CallContext.tsx ✅
│   ├── MeetingContext.tsx ✅
│   ├── WebSocketContext.tsx ✅
│   └── LivestreamContext.tsx 🟡 Stub
└── services/
    ├── callService.ts ✅
    ├── meetingService.ts ✅
    └── livestream.service.ts 🟡 Partial

📁 Backend (NestJS)
├── modules/chat/ ✅
├── modules/call/ ✅
├── modules/meeting/ ✅
└── modules/livestream/ ✅
```

---

## 🗓️ Lộ Trình Phát Triển (7 Tuần)

### Phase 1: Foundation (Tuần 1)

> **Mục tiêu:** Kích hoạt WebSocket, cấu hình cơ sở hạ tầng

#### Tasks

| #   | Task                            | File/Component                    | Priority  | Est. |
| --- | ------------------------------- | --------------------------------- | --------- | ---- |
| 1.1 | Enable WebSocket connection     | `context/WebSocketContext.tsx`    | 🔴 High   | 4h   |
| 1.2 | Verify backend WS endpoints     | `/chat`, `/call`, `/progress`     | 🔴 High   | 4h   |
| 1.3 | Configure environment variables | `config/env.ts`                   | 🔴 High   | 2h   |
| 1.4 | Setup LiveKit credentials       | `.env`, `app.config.ts`           | 🟡 Medium | 2h   |
| 1.5 | Create WebSocket hooks          | `hooks/useWebSocket.ts`           | 🔴 High   | 4h   |
| 1.6 | Add connection status UI        | `components/ConnectionStatus.tsx` | 🟢 Low    | 2h   |

#### Deliverables

- [ ] WebSocket connected và stable
- [ ] Environment variables configured
- [ ] Connection status indicator hoạt động

#### Environment Variables Cần Thiết

```env
# WebSocket
EXPO_PUBLIC_WS_URL=wss://baotienweb.cloud

# LiveKit (Video Calls/Meetings)
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-server.com

# Agora (Backup/Alternative)
AGORA_APP_ID=your_agora_app_id
```

---

### Phase 2: Messaging Complete (Tuần 2)

> **Mục tiêu:** Hoàn thiện tính năng nhắn tin real-time

#### Tasks

| #   | Task                             | File/Component                    | Priority  | Est. |
| --- | -------------------------------- | --------------------------------- | --------- | ---- |
| 2.1 | Connect chat to WebSocket        | `hooks/useMessages.ts`            | 🔴 High   | 6h   |
| 2.2 | Implement `newMessage` event     | `context/WebSocketContext.tsx`    | 🔴 High   | 4h   |
| 2.3 | Implement `userTyping` indicator | `components/TypingIndicator.tsx`  | 🟡 Medium | 3h   |
| 2.4 | Implement `messageRead` receipts | `app/messages/[userId].tsx`       | 🟡 Medium | 4h   |
| 2.5 | File/image attachments           | `services/uploadService.ts`       | 🟡 Medium | 6h   |
| 2.6 | Message reactions (emoji)        | `components/MessageReactions.tsx` | 🟢 Low    | 4h   |
| 2.7 | Group chat support               | `app/messages/group/[id].tsx`     | 🟡 Medium | 8h   |
| 2.8 | Message search                   | `hooks/useMessageSearch.ts`       | 🟢 Low    | 4h   |

#### Deliverables

- [ ] Real-time messages working
- [ ] Typing indicator hiển thị
- [ ] Read receipts (✓✓) working
- [ ] File attachments supported
- [ ] Group chat functional

#### WebSocket Events

```typescript
// Client → Server
interface ClientToServerEvents {
  sendMessage: (data: SendMessageDto) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
  markAsRead: (data: { messageIds: string[] }) => void;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
}

// Server → Client
interface ServerToClientEvents {
  newMessage: (message: Message) => void;
  userTyping: (data: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
  }) => void;
  messageRead: (data: {
    messageIds: string[];
    readBy: string;
    readAt: Date;
  }) => void;
  userOnlineStatus: (data: { userId: string; isOnline: boolean }) => void;
}
```

---

### Phase 3: Voice & Video Calls (Tuần 3-4)

> **Mục tiêu:** Cuộc gọi 1-1 với video/audio thực

#### Prerequisites

```bash
# Development build required (không dùng Expo Go)
npx expo run:android
# hoặc
eas build --profile development --platform android
```

#### Tasks

| #    | Task                          | File/Component                     | Priority  | Est. |
| ---- | ----------------------------- | ---------------------------------- | --------- | ---- |
| 3.1  | Install WebRTC dependencies   | `package.json`                     | 🔴 High   | 2h   |
| 3.2  | Create dev build config       | `eas.json`, `app.config.ts`        | 🔴 High   | 4h   |
| 3.3  | Implement call signaling      | `services/callSignaling.ts`        | 🔴 High   | 8h   |
| 3.4  | LiveKit token fetching        | `services/livekit.service.ts`      | 🔴 High   | 4h   |
| 3.5  | WebRTC connection setup       | `hooks/useWebRTC.ts`               | 🔴 High   | 12h  |
| 3.6  | Call UI - Outgoing            | `components/call/OutgoingCall.tsx` | 🟡 Medium | 6h   |
| 3.7  | Call UI - Incoming            | `components/call/IncomingCall.tsx` | 🟡 Medium | 6h   |
| 3.8  | Call UI - Active call         | `app/call/[userId].tsx`            | 🔴 High   | 8h   |
| 3.9  | Audio controls (mute/speaker) | `hooks/useCallControls.ts`         | 🟡 Medium | 4h   |
| 3.10 | Video controls (flip camera)  | `hooks/useVideoControls.ts`        | 🟡 Medium | 4h   |
| 3.11 | Call history sync             | `app/call/history.tsx`             | 🟢 Low    | 4h   |
| 3.12 | Push notification for calls   | `services/pushNotification.ts`     | 🔴 High   | 6h   |

#### Dependencies

```json
{
  "dependencies": {
    "react-native-webrtc": "^118.0.7",
    "@livekit/react-native": "^2.0.0",
    "@livekit/react-native-webrtc": "^118.0.0",
    "expo-av": "~14.0.0"
  }
}
```

#### Deliverables

- [ ] 1-1 voice calls working
- [ ] 1-1 video calls working
- [ ] Incoming call notification
- [ ] Call controls (mute, speaker, camera)
- [ ] Call history synced

#### Call Flow Diagram

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Caller    │ ──────────────────▶│   Server    │
│   (User A)  │                    │  (NestJS)   │
└─────────────┘                    └─────────────┘
       │                                  │
       │  1. initiateCall                 │
       │ ─────────────────────────────────▶
       │                                  │
       │                                  │  2. incomingCall
       │                                  │ ─────────────────▶
       │                                  │           ┌─────────────┐
       │                                  │           │   Callee    │
       │                                  │           │   (User B)  │
       │                                  │           └─────────────┘
       │                                  │                  │
       │                                  │  3. acceptCall   │
       │                                  │ ◀─────────────────
       │                                  │
       │  4. callAccepted + LiveKit token │
       │ ◀─────────────────────────────────
       │                                  │
       │         5. Connect to LiveKit Room          │
       │ ◀──────────────────────────────────────────▶│
       │              (WebRTC P2P/SFU)               │
```

---

### Phase 4: Meeting Rooms (Tuần 5)

> **Mục tiêu:** Video conferencing nhiều người

#### Tasks

| #    | Task                         | File/Component                        | Priority  | Est. |
| ---- | ---------------------------- | ------------------------------------- | --------- | ---- |
| 4.1  | Install LiveKit SDK          | `package.json`                        | 🔴 High   | 2h   |
| 4.2  | Create `useLiveKitRoom` hook | `hooks/useLiveKitRoom.ts`             | 🔴 High   | 8h   |
| 4.3  | Meeting lobby UI             | `app/meet/lobby/[code].tsx`           | 🟡 Medium | 6h   |
| 4.4  | Multi-participant video grid | `components/meet/VideoGrid.tsx`       | 🔴 High   | 10h  |
| 4.5  | Participant list panel       | `components/meet/ParticipantList.tsx` | 🟡 Medium | 4h   |
| 4.6  | Screen sharing support       | `hooks/useScreenShare.ts`             | 🟡 Medium | 6h   |
| 4.7  | In-meeting chat              | `components/meet/MeetingChat.tsx`     | 🟡 Medium | 4h   |
| 4.8  | Meeting controls bar         | `components/meet/ControlsBar.tsx`     | 🟡 Medium | 4h   |
| 4.9  | Recording (cloud)            | `services/meetingRecording.ts`        | 🟢 Low    | 4h   |
| 4.10 | Virtual backgrounds          | `hooks/useVirtualBackground.ts`       | 🟢 Low    | 8h   |

#### Deliverables

- [ ] Create/join meeting room
- [ ] Multi-participant video (up to 49)
- [ ] Screen sharing
- [ ] In-meeting chat
- [ ] Recording (optional)

#### Meeting Room Layout

```
┌──────────────────────────────────────────────────────────────┐
│  📹 Meeting: Project Review          👥 5 participants    ✕  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│   │ User 1  │ │ User 2  │ │ User 3  │ │ User 4  │          │
│   │ 🎤 📹   │ │ 🔇 📹   │ │ 🎤 📹   │ │ 🎤 🔴   │          │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                              │
│              ┌───────────────────────────┐                   │
│              │                           │                   │
│              │      Active Speaker       │                   │
│              │        (User 5)           │                   │
│              │         🎤 📹             │                   │
│              │                           │                   │
│              └───────────────────────────┘                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  🎤 Mute  │  📹 Video  │  📤 Share  │  💬 Chat  │  🔴 End  │
└──────────────────────────────────────────────────────────────┘
```

---

### Phase 5: Livestreams (Tuần 6)

> **Mục tiêu:** Phát và xem livestream

#### Tasks

| #    | Task                             | File/Component                           | Priority  | Est. |
| ---- | -------------------------------- | ---------------------------------------- | --------- | ---- |
| 5.1  | Full LivestreamContext           | `context/LivestreamContext.tsx`          | 🔴 High   | 8h   |
| 5.2  | RTMP/LiveKit ingress setup       | `services/livestream.service.ts`         | 🔴 High   | 8h   |
| 5.3  | Go Live UI                       | `app/live/create.tsx`                    | 🔴 High   | 6h   |
| 5.4  | Stream preview before going live | `components/live/StreamPreview.tsx`      | 🟡 Medium | 4h   |
| 5.5  | Viewer UI with real video        | `app/live/[id].tsx`                      | 🔴 High   | 8h   |
| 5.6  | Real-time comments overlay       | `components/live/CommentsOverlay.tsx`    | 🔴 High   | 6h   |
| 5.7  | Reactions animation (hearts)     | `components/live/ReactionsAnimation.tsx` | 🟡 Medium | 4h   |
| 5.8  | Viewer count sync                | `hooks/useLivestreamViewers.ts`          | 🟡 Medium | 3h   |
| 5.9  | Gift/donation system             | `components/live/GiftSystem.tsx`         | 🟢 Low    | 8h   |
| 5.10 | Stream recording/replay          | `app/live/replay/[id].tsx`               | 🟢 Low    | 6h   |
| 5.11 | Multi-host support (PK)          | `hooks/useMultiHost.ts`                  | 🟢 Low    | 10h  |

#### Deliverables

- [ ] Go live với camera
- [ ] Viewers xem stream real-time
- [ ] Real-time comments
- [ ] Reactions animation
- [ ] Recording/replay

#### Livestream Architecture

```
                    ┌──────────────────┐
                    │   Broadcaster    │
                    │   (Mobile App)   │
                    └────────┬─────────┘
                             │
                             │ RTMP / WebRTC
                             ▼
                    ┌──────────────────┐
                    │   Media Server   │
                    │   (LiveKit/SRS)  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Viewer 1 │  │ Viewer 2 │  │ Viewer N │
        │  (HLS)   │  │ (WebRTC) │  │  (HLS)   │
        └──────────┘  └──────────┘  └──────────┘
```

---

### Phase 6: Integration & Polish (Tuần 7)

> **Mục tiêu:** Tích hợp, tối ưu, kiểm thử

#### Tasks

| #   | Task                          | File/Component                    | Priority  | Est. |
| --- | ----------------------------- | --------------------------------- | --------- | ---- |
| 6.1 | Unified notification badges   | `context/UnifiedBadgeContext.tsx` | 🔴 High   | 4h   |
| 6.2 | Push notifications - calls    | `services/pushNotification.ts`    | 🔴 High   | 6h   |
| 6.3 | Push notifications - messages | `services/pushNotification.ts`    | 🔴 High   | 4h   |
| 6.4 | Offline message queue         | `services/offlineQueue.ts`        | 🟡 Medium | 6h   |
| 6.5 | Deep linking for calls/meets  | `app.config.ts`                   | 🟡 Medium | 4h   |
| 6.6 | Performance optimization      | All components                    | 🟡 Medium | 8h   |
| 6.7 | E2E tests                     | `e2e/communication.test.ts`       | 🟡 Medium | 8h   |
| 6.8 | Documentation                 | `docs/`                           | 🟢 Low    | 4h   |

#### Deliverables

- [ ] Unified badge count
- [ ] Push notifications working
- [ ] Offline support
- [ ] Deep links working
- [ ] Tests passing

---

## 📦 Dependencies Tổng Hợp

### NPM Packages

```json
{
  "dependencies": {
    // WebSocket
    "socket.io-client": "^4.7.0",

    // WebRTC / Video
    "react-native-webrtc": "^118.0.7",
    "@livekit/react-native": "^2.0.0",
    "@livekit/react-native-webrtc": "^118.0.0",

    // Media
    "expo-av": "~14.0.0",
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",

    // Notifications
    "expo-notifications": "~0.28.0",

    // Utilities
    "date-fns": "^3.0.0",
    "react-native-reanimated": "~3.10.0"
  }
}
```

### Native Modules (Development Build Required)

```bash
# Build cho Android
eas build --profile development --platform android

# Build cho iOS
eas build --profile development --platform ios
```

---

## 🔧 Backend API Requirements

### Endpoints Cần Thiết

```yaml
# Messages
POST   /api/messages/send
GET    /api/messages/conversations
GET    /api/messages/conversations/:id
POST   /api/messages/upload
WS     /chat (Socket.IO namespace)

# Calls
POST   /api/calls/initiate
POST   /api/calls/answer
POST   /api/calls/end
GET    /api/calls/history
GET    /api/calls/livekit-token
WS     /call (Socket.IO namespace)

# Meetings
POST   /api/meetings/create
GET    /api/meetings/scheduled
POST   /api/meetings/join/:code
GET    /api/meetings/livekit-token/:code
WS     /meeting (Socket.IO namespace)

# Livestreams
POST   /api/livestreams/start
POST   /api/livestreams/end
GET    /api/livestreams/active
GET    /api/livestreams/:id
GET    /api/livestreams/:id/comments
WS     /livestream (Socket.IO namespace)
```

---

## 📈 KPIs & Metrics

| Metric                   | Target       | Measurement               |
| ------------------------ | ------------ | ------------------------- |
| Message delivery latency | < 500ms      | Socket.IO round-trip      |
| Call setup time          | < 3s         | Time to first frame       |
| Video quality            | 720p @ 30fps | Adaptive bitrate          |
| Livestream latency       | < 5s         | HLS segment duration      |
| Connection reliability   | > 99%        | Reconnection success rate |

---

## ⚠️ Risks & Mitigations

| Risk                          | Impact | Mitigation                           |
| ----------------------------- | ------ | ------------------------------------ |
| WebRTC compatibility issues   | High   | Use LiveKit SDK (handles edge cases) |
| High bandwidth usage          | Medium | Adaptive bitrate, quality presets    |
| Battery drain during calls    | Medium | Optimize CPU usage, background mode  |
| Server scaling for livestream | High   | Use LiveKit Cloud or CDN             |
| Push notification delays      | Medium | Use FCM high priority                |

## 📝 Notes

1. **Expo Go không hỗ trợ** WebRTC native modules → Phải dùng Development Build
2. **LiveKit được khuyến nghị** thay vì raw WebRTC để giảm complexity
3. **Backend đã có sẵn** phần lớn API, cần verify và enable WebSocket
4. **Testing trên thiết bị thật** là bắt buộc cho tính năng video/audio

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install socket.io-client @livekit/react-native react-native-webrtc

# 2. Configure environment
cp .env.example .env
# Edit .env with LiveKit credentials

# 3. Create development build
eas build --profile development --platform android

# 4. Start development
npx expo start --dev-client
```

---

**Tổng thời gian dự kiến:** 7 tuần  
**Team size khuyến nghị:** 2-3 developers  
**Priority:** Messaging → Calls → Meetings → Livestreams
