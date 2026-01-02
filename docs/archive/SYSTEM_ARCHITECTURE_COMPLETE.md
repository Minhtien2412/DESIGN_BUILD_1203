# 🏗️ BACKEND-FRONTEND COMPREHENSIVE SYSTEM MAP

**Generated:** December 19, 2025  
**Purpose:** Audit toàn bộ hệ thống BE/FE, identify gaps, và implementation plan

---

## 📊 BACKEND INVENTORY (Complete)

### ✅ Communication Modules (FULLY READY)

#### 1. **Chat Module** - 100% Complete
**Backend:**
- REST: `/api/v1/messages/*`
- WebSocket: `wss://baotienweb.cloud/chat`
- Features:
  - ✅ Send message (1-1, group)
  - ✅ Get conversations
  - ✅ Get messages (pagination)
  - ✅ Mark as read
  - ✅ Real-time delivery (WebSocket)
  - ✅ Typing indicators
  - ✅ Online/offline status
  - ✅ File attachments

**Frontend:**
- ✅ Context: `ChatContext.tsx` EXISTS
- ✅ Service: `services/chat.ts` EXISTS  
- ⚠️ **STATUS:** Context exists BUT not integrated with components
- ❌ **MISSING:** Chat UI screens

---

#### 2. **Call Module** - 95% Complete
**Backend:**
- REST: `/api/v1/call/*`
- WebSocket: `wss://baotienweb.cloud/call`
- Features:
  - ✅ Start call (voice/video)
  - ✅ Accept/reject call
  - ✅ End call
  - ✅ Call history
  - ✅ WebRTC signaling (offer/answer/ICE)
  - ✅ Missed calls
  - ⚠️ **MISSING:** Group calls, call recording

**Frontend:**
- ✅ Context: `CallContext.tsx` - COMPLETE
- ✅ Components: `ActiveCallScreen.tsx` - COMPLETE
- ✅ Utils: `VideoCallManager.ts` - COMPLETE
- ⚠️ **STATUS:** Fully implemented BUT needs development build to test
- ⚠️ **BLOCKER:** Backend fixes not deployed yet

---

#### 3. **Video Room Module (LiveKit)** - 100% Complete
**Backend:**
- REST: `/api/v1/video/*`
- LiveKit SDK: INSTALLED & CONFIGURED
- Features:
  - ✅ Create room
  - ✅ Join room (multi-party)
  - ✅ Generate access tokens
  - ✅ Room management
  - ✅ Participant tracking
  - ✅ Screen sharing support
  - ✅ Recording ready

**Frontend:**
- ❌ **MISSING:** No LiveKit integration
- ❌ **MISSING:** Video room UI
- ❌ **MISSING:** Multi-party video call
- 🚨 **CRITICAL GAP:** Backend hoàn chỉnh nhưng FE chưa dùng!

---

#### 4. **Comments Module** - 70% Complete
**Backend:**
- REST: `/api/v1/comments/*`
- Features:
  - ✅ Create comment (project/task)
  - ✅ Get comments (filtered)
  - ✅ Delete comment
  - ⚠️ **MISSING:** Edit comment
  - ⚠️ **MISSING:** Reply/threading
  - ⚠️ **MISSING:** Reactions (like, emoji)

**Frontend:**
- ❌ **MISSING:** No comment components
- ❌ **MISSING:** No comment service
- 🚨 **CRITICAL GAP:** Backend có sẵn nhưng FE chưa dùng!

---

#### 5. **Notifications Module** - 60% Complete
**Backend:**
- REST: `/api/v1/notifications/*`
- Features:
  - ✅ Create notification (DB)
  - ✅ Get notifications (user)
  - ✅ Mark as read
  - ✅ Delete notification
  - ❌ **MISSING:** WebSocket gateway (real-time push)
  - ❌ **MISSING:** FCM integration (mobile push)
  - ❌ **MISSING:** Email notifications

**Frontend:**
- ✅ Context: `NotificationContext.tsx` EXISTS
- ✅ Context: `PushNotificationContext.tsx` EXISTS
- ⚠️ **STATUS:** Partial - có storage nhưng chưa real-time
- ⚠️ **BLOCKER:** BE chưa có WebSocket gateway

---

### ✅ Content & Management Modules

#### 6. **Projects Module** - 90% Complete
**Backend:**
- REST: `/api/v1/projects/*`
- Features:
  - ✅ CRUD projects
  - ✅ Project members
  - ✅ Project timeline
  - ✅ Progress tracking
  - ✅ File attachments
  - ⚠️ **MISSING:** Project templates

**Frontend:**
- ✅ Service: `services/constructionProjects.ts` - COMPLETE
- ✅ Screens: Project list, detail screens
- ✅ **STATUS:** Fully working

---

#### 7. **Tasks Module** - 85% Complete
**Backend:**
- REST: `/api/v1/tasks/*`
- Features:
  - ✅ CRUD tasks
  - ✅ Task assignment
  - ✅ Status updates
  - ✅ Due dates
  - ⚠️ **MISSING:** Subtasks
  - ⚠️ **MISSING:** Task dependencies

**Frontend:**
- ✅ Service: `services/api/task.service.ts`
- ⚠️ **STATUS:** Partial integration

---

#### 8. **Timeline/Progress Module** - 100% Complete
**Backend:**
- REST: `/api/v1/timeline/*`
- WebSocket: `wss://baotienweb.cloud/progress`
- Features:
  - ✅ Create timeline events
  - ✅ Real-time progress updates
  - ✅ Photo timeline
  - ✅ Activity feed

**Frontend:**
- ✅ Context: `ProgressWebSocketContext.tsx` - COMPLETE
- ✅ Service: `services/communication.ts` (PhotoTimeline)
- ✅ **STATUS:** Fully working

---

#### 9. **Video Content Module** - 90% Complete
**Backend:**
- REST: `/api/v1/video/*`
- Features:
  - ✅ Upload video
  - ✅ Video metadata
  - ✅ Video player stats
  - ✅ Thumbnails
  - ⚠️ **MISSING:** Video transcoding queue

**Frontend:**
- ✅ Context: `VideoInteractionsContext.tsx`
- ✅ Service: `services/api/video.service.ts`
- ✅ **STATUS:** Fully working

---

### ✅ Business Modules

#### 10. **Products Module** - 85%
- REST: `/api/v1/products/*`
- ✅ CRUD, categories, search
- ⚠️ Missing: Reviews, ratings

#### 11. **Payment Module** - 80%
- REST: `/api/v1/payment/*`
- ✅ Create payment, verify, refund
- ⚠️ Missing: Recurring payments

#### 12. **Contract Module** - 75%
- REST: `/api/v1/contract/*`
- ✅ CRUD contracts, templates
- ⚠️ Missing: E-signature

#### 13. **Fleet Module** - 70%
- REST: `/api/v1/fleet/*`
- ✅ Vehicle tracking, maintenance
- ⚠️ Missing: Real-time GPS

#### 14. **QC Module** - 65%
- REST: `/api/v1/qc/*`
- ✅ Inspections, checklists
- ⚠️ Missing: Photo annotations

#### 15. **CRM Module** - 60%
- REST: `/api/v1/crm/*`
- ✅ Lead management, customers
- ⚠️ Missing: Email campaigns

---

## 🚨 CRITICAL GAPS (FE Missing BE Features)

### 1. **LiveKit Video Rooms** 🔴 HIGH PRIORITY
**Backend:** ✅ 100% ready
**Frontend:** ❌ Not implemented

**What's Available:**
```typescript
// BE Endpoints
POST /api/v1/video/join-room
POST /api/v1/video/create-room
GET  /api/v1/video/room-info
POST /api/v1/video/leave-room

// LiveKit SDK installed
// Tokens generated automatically
// Multi-party support ready
// Screen sharing ready
```

**What FE Needs:**
```bash
npm install @livekit/react-native
# OR
npm install livekit-client
```

**Implementation Needed:**
- LiveKit room component
- Multi-party video UI
- Screen sharing controls
- Room participant list

---

### 2. **Comments System** 🔴 HIGH PRIORITY
**Backend:** ✅ 70% ready
**Frontend:** ❌ Not implemented

**What's Available:**
```typescript
// BE Endpoints
POST /api/v1/comments (create)
GET  /api/v1/comments?projectId=X&taskId=Y
DELETE /api/v1/comments/:id
```

**What FE Needs:**
- Comment list component
- Comment input component
- Comment service layer
- Real-time updates (WebSocket)

---

### 3. **Real-Time Notifications** 🔴 HIGH PRIORITY
**Backend:** ⚠️ 60% (missing WebSocket)
**Frontend:** ⚠️ 50% (context exists, no real-time)

**What's Missing:**
```typescript
// BE needs:
@WebSocketGateway({ namespace: '/notifications' })
export class NotificationsGateway {
  @SubscribeMessage('subscribe')
  handleSubscribe() { ... }
  
  sendNotification(userId, notification) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }
}

// FE needs:
const socket = io('wss://baotienweb.cloud/notifications');
socket.on('notification', (notif) => {
  // Show toast/banner
  // Update notification count
  // Play sound
});
```

---

### 4. **Chat UI** 🟡 MEDIUM PRIORITY
**Backend:** ✅ 100% ready (REST + WebSocket)
**Frontend:** ⚠️ Context exists, no UI

**What's Available:**
```typescript
// BE fully working:
// - Chat gateway
// - Message storage
// - Typing indicators
// - Read receipts
// - File attachments
```

**What FE Needs:**
- Chat list screen
- Conversation screen  
- Message input component
- File upload integration
- Connect to existing ChatContext

---

## 📱 FRONTEND INVENTORY

### ✅ Implemented Contexts (18 total)

| Context | Status | Integration | Notes |
|---------|--------|-------------|-------|
| AuthContext | ✅ 100% | ✅ Used | Fully working |
| CallContext | ✅ 100% | ✅ Used | WebRTC ready |
| ChatContext | ✅ 90% | ❌ Unused | Backend ready, no UI |
| NotificationContext | ⚠️ 60% | ⚠️ Partial | No real-time |
| MessageContext | ⚠️ 50% | ❌ Unused | Duplicate of Chat? |
| WebSocketContext | ✅ 100% | ✅ Used | Generic WS |
| ProgressWebSocketContext | ✅ 100% | ✅ Used | Timeline working |
| VideoInteractionsContext | ✅ 100% | ✅ Used | Content videos |
| PermissionContext | ✅ 100% | ✅ Used | System permissions |
| PushNotificationContext | ⚠️ 50% | ⚠️ Partial | Expo notifications |
| LiveContext | ❓ Unknown | ❓ Unknown | Need audit |
| PlayerContext | ✅ 100% | ✅ Used | Video player |
| UtilitiesContext | ✅ 90% | ✅ Used | Tools/utils |
| ThemeContext | ✅ 100% | ✅ Used | Dark/light mode |
| FavoritesContext | ✅ 80% | ✅ Used | User favorites |
| CompareContext | ✅ 70% | ⚠️ Partial | Product compare |
| ConnectionContext | ✅ 100% | ✅ Used | Network status |
| ViewHistoryContext | ✅ 80% | ✅ Used | View tracking |

---

### ⚠️ Duplicate or Overlapping Contexts

**ChatContext vs MessageContext:**
- ChatContext: WebSocket real-time
- MessageContext: REST API only
- 🚨 **ACTION:** Merge or clarify purpose

---

## 🗺️ COMPLETE SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP (React Native)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Authentication  │  │   Navigation     │                │
│  │  - Login/Register│  │  - Tabs (4)      │                │
│  │  - JWT Tokens    │  │  - Modals        │                │
│  │  - Social OAuth  │  │  - Deep Links    │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              COMMUNICATION LAYER                        │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ✅ Call (WebRTC)      ⚠️ Chat (No UI)                 │ │
│  │  ├─ Voice calls        ├─ Context ready                │ │
│  │  ├─ Video calls        ├─ WebSocket ready              │ │
│  │  ├─ Screen            ├─ Missing: UI screens           │ │
│  │  └─ Controls          └─ Missing: Message list         │ │
│  │                                                          │ │
│  │  ❌ LiveKit Rooms      ❌ Comments                      │ │
│  │  └─ NOT IMPLEMENTED    └─ NOT IMPLEMENTED              │ │
│  │                                                          │ │
│  │  ⚠️ Notifications                                       │ │
│  │  ├─ Local storage      ├─ Toast/Banner                │ │
│  │  ├─ Badge count        └─ Missing: Real-time push     │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              CONTENT & BUSINESS                         │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  ✅ Projects          ✅ Tasks           ✅ Timeline   │ │
│  │  ✅ Products          ✅ Videos          ✅ Photos     │ │
│  │  ⚠️ Payments          ⚠️ Contracts       ⚠️ QC        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │   NETWORK       │
                   │   BOUNDARY      │
                   └────────┬────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                    BACKEND API (NestJS)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              REST API LAYER                             │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  /api/v1/auth      /api/v1/users     /api/v1/projects │ │
│  │  /api/v1/call      /api/v1/messages  /api/v1/tasks    │ │
│  │  /api/v1/video     /api/v1/comments  /api/v1/timeline │ │
│  │  /api/v1/notif     /api/v1/products  /api/v1/payment  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              WEBSOCKET GATEWAYS                         │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  ✅ /chat          - Real-time messaging                │ │
│  │  ✅ /call          - WebRTC signaling                   │ │
│  │  ✅ /progress      - Timeline updates                   │ │
│  │  ❌ /notifications  - MISSING (critical gap!)           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              THIRD-PARTY INTEGRATIONS                   │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  ✅ LiveKit SDK    - Multi-party video (ready!)         │ │
│  │  ✅ Socket.IO      - WebSocket infrastructure           │ │
│  │  ✅ Prisma ORM     - Database access                    │ │
│  │  ✅ AWS S3         - File storage                       │ │
│  │  ⚠️ FCM/APNS       - Push (SDK installed, not used)    │ │
│  │  ⚠️ SendGrid       - Email (SDK installed, not used)   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │   PostgreSQL    │
                   │   (45+ tables)  │
                   └─────────────────┘
```

---

## 🎯 IMPLEMENTATION PRIORITY MATRIX

### 🔴 CRITICAL (Do NOW)

**1. Deploy Backend WebRTC Fixes** (5 minutes)
```bash
.\deploy-backend-webrtc.ps1
```
- Fix call signaling
- Enable video calls end-to-end

**2. Add Notifications WebSocket Gateway** (2 hours)
```typescript
// BE: src/notifications/notifications.gateway.ts
@WebSocketGateway({ namespace: '/notifications' })
export class NotificationsGateway { ... }

// FE: Update NotificationContext
const socket = io('wss://baotienweb.cloud/notifications');
```

**3. Integrate LiveKit Video Rooms** (4 hours)
```bash
# FE install
npm install @livekit/react-native

# Create screens:
# - app/video-room/[id].tsx
# - components/video/LiveKitRoom.tsx
```

---

### 🟡 HIGH (Do This Week)

**4. Build Chat UI** (6 hours)
- app/chat.tsx (conversation list)
- app/chat/[id].tsx (messages)
- components/chat/MessageBubble.tsx
- Connect to existing ChatContext

**5. Add Comments System** (4 hours)
- components/comments/CommentList.tsx
- components/comments/CommentInput.tsx
- services/comments.ts
- Integrate with projects/tasks

**6. Complete WebRTC Testing** (2 hours)
- Build development build
- Test on 2 devices
- Fix any bugs found

---

### 🟢 MEDIUM (Do This Month)

**7. Enhance Notifications** (8 hours)
- FCM integration (mobile push)
- Email notifications (SendGrid)
- In-app notification center UI
- Notification preferences

**8. Clean Up Sitemap** (6 hours)
- Create missing category screens
- Add service detail pages
- Build tool screens (calculator, budget, 3D viewer)
- Remove/repurpose menu4-menu9

**9. Advanced Features** (varies)
- Comment editing/threading
- Group calls
- Call recording
- Screen sharing UI
- Video transcoding
- E-signatures

---

## 📝 SPECIFIC TASKS BREAKDOWN

### Task 1: Deploy Backend WebRTC (NOW)
```bash
# Terminal 1: Keep Expo running
npm start

# Terminal 2: Deploy
.\deploy-backend-webrtc.ps1
```

**Expected Outcome:**
- Call signaling works correctly
- Video calls connect successfully

---

### Task 2: Add Notifications WebSocket (2h)

**Backend Changes:**
```typescript
// File: BE-baotienweb.cloud/src/notifications/notifications.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ 
  namespace: '/notifications',
  cors: { origin: '*' }
})
export class NotificationsGateway {
  @WebSocketServer() server: Server;
  private userSockets = new Map<number, string>();

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: number) {
    this.userSockets.set(userId, client.id);
    console.log(`User ${userId} registered for notifications`);
  }

  // Called by NotificationsService when creating notification
  sendToUser(userId: number, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }
}
```

**Frontend Changes:**
```typescript
// File: context/NotificationContext.tsx
import io from 'socket.io-client';

const notificationSocket = io('wss://baotienweb.cloud/notifications');

notificationSocket.on('connect', () => {
  if (user) {
    notificationSocket.emit('register', user.id);
  }
});

notificationSocket.on('notification', (notification) => {
  // Add to local state
  setNotifications(prev => [notification, ...prev]);
  
  // Show toast
  Toast.show({
    type: 'info',
    text1: notification.title,
    text2: notification.message,
  });
  
  // Play sound
  playNotificationSound();
  
  // Update badge
  setBadgeCount(prev => prev + 1);
});
```

---

### Task 3: Integrate LiveKit (4h)

**Install Package:**
```bash
npm install @livekit/react-native
npx pod-install # iOS only
```

**Create Room Screen:**
```typescript
// File: app/video-room/[id].tsx
import { LiveKitRoom, VideoConference } from '@livekit/react-native';
import { useLocalSearchParams } from 'expo-router';

export default function VideoRoomScreen() {
  const { id } = useLocalSearchParams();
  const [roomToken, setRoomToken] = useState<string>();

  useEffect(() => {
    // Get token from backend
    fetch(`https://baotienweb.cloud/api/v1/video/join-room`, {
      method: 'POST',
      body: JSON.stringify({ roomName: id }),
    })
      .then(res => res.json())
      .then(data => setRoomToken(data.token));
  }, [id]);

  if (!roomToken) return <Loader />;

  return (
    <LiveKitRoom
      serverUrl="wss://livekit.baotienweb.cloud" // Your LiveKit server
      token={roomToken}
      connect={true}
      audio={true}
      video={true}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
```

**Add Navigation:**
```typescript
// From any screen:
router.push(`/video-room/${roomId}`);
```

---

### Task 4: Build Chat UI (6h)

**Conversation List:**
```typescript
// File: app/chat.tsx
import { useChatContext } from '@/context/ChatContext';

export default function ChatListScreen() {
  const { conversations, loading } = useChatContext();

  return (
    <FlatList
      data={conversations}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/chat/${item.id}`)}>
          <View style={styles.conversationItem}>
            <Avatar source={{ uri: item.otherUser.avatar }} />
            <View>
              <Text>{item.otherUser.name}</Text>
              <Text>{item.lastMessage.content}</Text>
            </View>
            {item.unreadCount > 0 && (
              <Badge value={item.unreadCount} />
            )}
          </View>
        </Pressable>
      )}
    />
  );
}
```

**Conversation Screen:**
```typescript
// File: app/chat/[id].tsx
import { useChatContext } from '@/context/ChatContext';
import { GiftedChat } from 'react-native-gifted-chat';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const { messages, sendMessage, isTyping } = useChatContext();

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => sendMessage(messages[0])}
      user={{ _id: currentUser.id }}
      isTyping={isTyping}
    />
  );
}
```

---

### Task 5: Add Comments (4h)

**Comment Component:**
```typescript
// File: components/comments/CommentList.tsx
export function CommentList({ projectId }: { projectId: number }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch(`/api/v1/comments?projectId=${projectId}`)
      .then(res => res.json())
      .then(setComments);
  }, [projectId]);

  return (
    <View>
      {comments.map(comment => (
        <View key={comment.id} style={styles.comment}>
          <Avatar source={{ uri: comment.user.avatar }} />
          <View>
            <Text style={styles.userName}>{comment.user.name}</Text>
            <Text>{comment.content}</Text>
            <Text style={styles.timestamp}>
              {formatDate(comment.createdAt)}
            </Text>
          </View>
        </View>
      ))}
      <CommentInput onSubmit={addComment} />
    </View>
  );
}
```

---

## 🎯 NEXT IMMEDIATE ACTIONS

**RIGHT NOW (5 minutes):**
```bash
# Deploy backend WebRTC fixes
.\deploy-backend-webrtc.ps1
```

**TODAY (2 hours):**
1. Add Notifications WebSocket Gateway (BE)
2. Update NotificationContext (FE)
3. Test real-time notifications

**THIS WEEK (10 hours):**
1. Integrate LiveKit video rooms
2. Build chat UI screens
3. Add comments system
4. Test WebRTC end-to-end

**THIS MONTH:**
- Complete sitemap
- Add missing screens
- Polish all features
- Production deployment

---

**Question:** Bạn muốn bắt đầu với task nào?
- **A.** Deploy backend WebRTC ngay (5 phút)
- **B.** Add Notifications WebSocket (2 giờ)
- **C.** Integrate LiveKit (4 giờ)
- **D.** Build Chat UI (6 giờ)
- **E.** Tạo complete system diagram trước

Chọn A/B/C/D/E? 🚀
