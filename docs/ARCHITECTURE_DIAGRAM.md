# 🏗️ APP DESIGN BUILD - Architecture Diagram

## Cập nhật: 2026-01-26

---

## 📊 Tổng Quan Cấu Trúc

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Expo/React Native)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  app/                           │  features/                                │
│  ├── (tabs)/  [5 main tabs]     │  ├── auth/     - Authentication screens  │
│  ├── (auth)/  [Auth flow]       │  ├── chat/     - Chat components         │
│  ├── messages/ [Chat routes]    │  ├── call/     - Call screens            │
│  ├── call/    [Call routes]     │  ├── profile/  - Profile screens         │
│  ├── projects/ [Project mgmt]   │  ├── notifications/ - Notification UI    │
│  └── ...100+ routes             │  └── community/ - Social features        │
├─────────────────────────────────────────────────────────────────────────────┤
│  services/                      │  hooks/                                   │
│  ├── socketManager.ts [WS]      │  ├── useSocket.ts                        │
│  ├── api.ts [REST client]       │  ├── useAuth.ts                          │
│  ├── authService.ts             │  ├── useMessages.ts                      │
│  ├── chatAPIService.ts          │  ├── useNotifications.ts                 │
│  ├── notificationService.ts     │  └── useRealTimeCommunication.ts         │
│  └── ...200+ services           │                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  context/                       │  components/                              │
│  ├── AuthContext.tsx            │  ├── chat/     - Chat UI components      │
│  ├── UnifiedBadgeContext.tsx    │  ├── messages/ - Message components      │
│  ├── I18nContext (i18n.ts)      │  ├── community/- Feed, video players     │
│  └── ThemeContext               │  └── ui/       - Shared UI components    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API / WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (NestJS)                                │
│                        BE-baotienweb.cloud/src/                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Core Modules:                                                               │
│  ├── auth/           - JWT, OAuth, 2FA, OTP, RBAC                           │
│  ├── users/          - User management                                       │
│  ├── chat/           - Chat rooms, messages, search                         │
│  ├── conversations/  - Conversation management                               │
│  ├── call/           - Voice/Video call with LiveKit                        │
│  ├── notifications/  - Push notifications (FCM)                             │
│  └── prisma/         - Database ORM                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Business Modules:                                                           │
│  ├── projects/       - Project management                                    │
│  ├── products/       - E-commerce products                                   │
│  ├── payment/        - VNPay, Momo, ZaloPay                                 │
│  ├── crm/            - Perfex CRM integration                               │
│  ├── ai/             - OpenAI, Gemini integration                           │
│  └── ...40+ modules                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure:                                                             │
│  ├── cache/          - Redis caching                                        │
│  ├── upload/         - File upload, S3                                      │
│  ├── email/          - SMTP, SendGrid                                       │
│  ├── logger/         - Structured logging                                   │
│  └── metrics/        - Performance monitoring                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE & SERVICES                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL          │  Redis              │  LiveKit              │ S3    │
│  - Users             │  - Session cache    │  - WebRTC calls       │ Files │
│  - Projects          │  - Rate limiting    │  - Video streaming    │       │
│  - Messages          │  - Token storage    │  - Room management    │       │
│  - Notifications     │  - Pub/Sub          │                       │       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 WebSocket Flow

```
┌─────────────┐      socket.io       ┌─────────────────┐
│   Client    │ ◄──────────────────► │   Backend WS    │
│             │                       │   Gateway       │
└─────────────┘                       └─────────────────┘
       │                                      │
       │  Namespaces:                         │
       │  ├── /chat    [Messages]             │
       │  ├── /call    [Calls]                │
       │  └── /progress [Project updates]     │
       │                                      │
       │  Events:                             │
       │  ├── message:new                     │
       │  ├── message:read                    │
       │  ├── typing:start/stop               │
       │  ├── presence:update                 │
       │  ├── call:incoming                   │
       │  ├── call:accepted                   │
       │  └── notification:new                │
       ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Socket Manager (services/socketManager.ts)    │
│  - Auto-reconnection with exponential backoff                   │
│  - Room management (join/leave)                                  │
│  - Presence tracking                                             │
│  - Message acknowledgments                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Main Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         _layout.tsx                              │
│  Providers: Auth → Theme → I18n → Badge → Socket                │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   (auth)/     │     │   (tabs)/     │     │   intro/      │
│   Login       │     │   Main App    │     │   Onboarding  │
│   Register    │     │   5 Tabs      │     │               │
│   OTP         │     │               │     │               │
│   2FA         │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                              │
        ┌──────┬──────┬──────┼──────┬──────┐
        ▼      ▼      ▼      ▼      ▼      ▼
     Home  Projects Community Messages Profile
      │       │         │        │        │
      │       │         │        │        ├── settings/
      │       │         │        │        ├── security/
      │       │         │        │        └── language/
      │       │         │        │
      │       │         │        └── chat/[id]
      │       │         │            └── Real-time messaging
      │       │         │
      │       │         └── reels, stories, feed
      │       │
      │       └── [id]/
      │           ├── timeline
      │           ├── documents
      │           └── chat
      │
      └── Quick actions, weather, news
```

---

## 🔐 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │ ──► │   OTP/2FA   │ ──► │   Home      │
│   Screen    │     │   Verify    │     │   Screen    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │  Methods:         │                   │
       ├── Email/Password  │                   │
       ├── Phone + OTP     │                   │
       ├── Google OAuth    │                   │
       ├── Zalo OAuth      │                   │
       └── Biometric       │                   │
                           │                   │
                    ┌──────┴──────┐            │
                    │   Backend   │            │
                    │   auth/     │            │
                    │  - JWT      │◄───────────┘
                    │  - Refresh  │   Token refresh
                    │  - Session  │
                    └─────────────┘
```

---

## 💬 Chat System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CHAT SYSTEM                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend Routes:                                             │
│  ├── /messages           → Conversation list                 │
│  ├── /messages/[id]      → Chat room (RECOMMENDED)           │
│  ├── /messages/unified   → Unified messages screen           │
│  └── /chat/[chatId]      → Legacy chat (deprecated)          │
│                                                               │
│  Services:                                                    │
│  ├── socketManager.ts    → WebSocket connection              │
│  ├── chatAPIService.ts   → REST API calls                    │
│  ├── message.service.ts  → Message business logic            │
│  └── chatRealtime.ts     → Real-time events                  │
│                                                               │
│  Backend:                                                     │
│  ├── chat.service.ts           → Room & message CRUD         │
│  ├── chat-attachment.service   → File attachments            │
│  ├── message-search.service    → Full-text search            │
│  └── chat.gateway.ts           → WebSocket gateway           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎥 Media System (expo-av Migration)

### Current Status: expo-av (Deprecated in SDK 54)

Files using expo-av:

- `components/community/FeedVideoPlayer.tsx`
- `components/community/AdvancedVideoPlayer.tsx`
- `components/chat/VoiceMessagePlayer.tsx`
- `components/chat/VoiceRecorder.tsx`
- `components/messages/VoicePlayer.tsx`
- `components/messages/VoiceRecorder.tsx`
- `components/products/VideoPlayer.tsx`
- `components/viewer/VideoViewerScreen.tsx`
- `components/live/LivePlayer.tsx`
- `features/call/PremiumCallScreen.tsx`
- `services/ringtoneService.ts`
- `services/voiceRecording.ts`

### Migration Plan:

```
expo-av                    →    expo-audio + expo-video
─────────────────────────────────────────────────────────
Audio.Sound               →    useAudioPlayer (expo-audio)
Audio.Recording           →    useAudioRecorder (expo-audio)
Video component           →    VideoView (expo-video)
```

---

## 🔔 Notification System

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Types:                                                          │
│  ├── Push (FCM)      → System notifications, calls              │
│  ├── In-App          → Toast notifications                       │
│  └── Badge           → Unread count on tabs                      │
│                                                                  │
│  Flow:                                                           │
│  Backend → FCM/WebSocket → notificationService.ts                │
│                             ├── Push notification                │
│                             ├── Update badge count               │
│                             └── Navigate to relevant screen      │
│                                                                  │
│  Badge Context (UnifiedBadgeContext.tsx):                        │
│  ├── messagesCount   → Unread messages                          │
│  ├── callsCount      → Missed calls                             │
│  ├── notificationsCount → System notifications                  │
│  └── Total badge on app icon                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ API Endpoints Summary

| Category      | Endpoint                  | Status    |
| ------------- | ------------------------- | --------- |
| Auth          | `/api/v1/auth/*`          | ✅ Active |
| Users         | `/api/v1/users/*`         | ✅ Active |
| Chat          | `/api/v1/chat/*`          | ✅ Active |
| Messages      | `/api/v1/messages/*`      | ✅ Active |
| Notifications | `/api/v1/notifications/*` | ✅ Active |
| Projects      | `/api/v1/projects/*`      | ✅ Active |
| Products      | `/api/v1/products/*`      | ✅ Active |
| Upload        | `/api/v1/upload/*`        | ✅ Active |
| AI            | `/api/v1/ai/*`            | ✅ Active |
| CRM           | `/api/v1/crm/*`           | ✅ Active |

---

## ⚠️ Known Issues & Fixes Needed

1. **Text node in View error**
   - Cause: Conditional rendering with `&&` leaving text in View
   - Fix: Use ternary operators or null checks

2. **pointerEvents deprecated**
   - Cause: Using `pointerEvents="none"` as prop
   - Fix: Use `style={{ pointerEvents: 'none' }}`

3. **expo-av deprecation**
   - Status: Will be removed in SDK 54
   - Action: Migrate to expo-audio + expo-video

4. **WebSocket connection issues**
   - Status: Working but needs monitoring
   - Fix: Check ENV.WS_BASE_URL configuration

---

## 📝 Recommended Actions

1. **Consolidate chat routes** → Use `/messages/[id]` as primary
2. **Migrate media components** → expo-audio + expo-video
3. **Fix View text node errors** → Update conditional rendering
4. **Update pointerEvents usage** → Move to style prop
5. **Monitor WebSocket health** → Add connection status UI
