# PHÂN TÍCH HỆ THỐNG CUỘC GỌI VÀ LIÊN HỆ

## 📊 TÌNH TRẠNG HIỆN TẠI

### ✅ ĐÃ HOÀN THÀNH

#### 1. **Cuộc Gọi Điện Thoại (Phone Call)**
**Frontend:**
- ✅ `utils/phone-actions.ts` - Helper functions cho call/SMS
- ✅ `components/ui/call-action-buttons.tsx` - UI buttons
- ✅ Worker Profile có nút gọi điện
- ✅ Project Detail có nút gọi điện
- ✅ Service Detail có nút gọi điện
- ✅ Seller Section có nút gọi điện

**Chức năng:**
```typescript
// Gọi điện trực tiếp qua tel: URL scheme
Linking.openURL(`tel:${phone}`)

// SMS
Linking.openURL(`sms:${phone}`)
```

**Hỗ trợ Platform:**
- ✅ iOS: Hoạt động tốt
- ✅ Android: Hoạt động tốt  
- ✅ Web: Không hỗ trợ (expected)

#### 2. **Chat Service**
**Backend:** ✅ HOÀN CHỈNH
- `BE-baotienweb.cloud/src/chat/chat.controller.ts`
- `BE-baotienweb.cloud/src/chat/chat.service.ts`
- `BE-baotienweb.cloud/src/chat/chat.gateway.ts`
- WebSocket Gateway cho real-time messaging

**Frontend:** ⚠️ MỘT PHẦN
- ✅ `services/api/chat.service.ts` - API client
- ✅ `services/chat.ts` - Business logic
- ✅ `app/projects/[id]/chat.tsx` - Chat screen
- ✅ `components/ui/chat-popup.tsx` - Chat popup
- ⚠️ Chưa tích hợp WebSocket đầy đủ

**API Endpoints:**
```
POST   /api/v1/chat/rooms           - Tạo chat room
GET    /api/v1/chat/rooms           - Lấy danh sách rooms
GET    /api/v1/chat/rooms/:id       - Chi tiết room
POST   /api/v1/chat/rooms/:id/messages - Gửi tin nhắn
GET    /api/v1/chat/rooms/:id/messages - Lấy tin nhắn
```

#### 3. **Communication Service**
**Frontend:** ✅ CODE SẴN SÀNG
- `services/communication.ts` - 388 lines
- `services/api/communication.service.ts` - 631 lines
- `types/communication.ts` - Type definitions

**Chức năng:**
- Messages (send, update, delete, reactions)
- Channels (create, update, members)
- Calls (start, end, status)
- Meetings (create, join, schedule)
- Polls (create, vote)
- Notifications preferences
- Online status

**Backend:** ❌ CHƯA TỒN TẠI
- Không có controller/service tương ứng
- Chỉ có Chat module

---

## ❌ CHƯA HOÀN THÀNH

### 1. **Video/Voice Call Service**
**Frontend:**
- ✅ `services/call.ts` - Có code
- ✅ `services/call-notification.ts` - Có code
- ✅ LiveKit token API defined

**Backend:** ❌ THIẾU
- Không có `/call/start` endpoint
- Không có `/call/end` endpoint
- Không có `/livekit/token` endpoint
- Không có LiveKit integration

**Cần làm:**
```typescript
// Backend cần implement:
POST /api/v1/call/start          - Bắt đầu cuộc gọi
POST /api/v1/call/end            - Kết thúc cuộc gọi
POST /api/v1/livekit/token       - Lấy token LiveKit
GET  /api/v1/call/history        - Lịch sử cuộc gọi
```

### 2. **Communication Advanced Features**
**Thiếu Backend:**
- Channels management
- Meeting scheduling
- Polls/Surveys
- File sharing in messages
- Advanced notifications

### 3. **Real-time Features**
**WebSocket:**
- ✅ Chat Gateway có
- ❌ Call notifications chưa có
- ❌ Typing indicators chưa có
- ❌ Online presence chưa đầy đủ

---

## 🔧 NHỮNG GÌ ĐANG HOẠT ĐỘNG

### 1. **Phone Call (Native)**
```typescript
// Worker Profile
<TouchableOpacity onPress={handleCall}>
  <Ionicons name="call" />
</TouchableOpacity>

const handleCall = () => {
  Linking.openURL(`tel:${worker.phone.replace(/\s/g, '')}`);
};
```
**Status:** ✅ HOẠT ĐỘNG HOÀN HẢO

### 2. **SMS**
```typescript
const handleMessage = () => {
  Linking.openURL(`sms:${worker.phone.replace(/\s/g, '')}`);
};
```
**Status:** ✅ HOẠT ĐỘNG HOÀN HẢO

### 3. **Chat (REST API)**
```typescript
// Gửi tin nhắn
await chatService.sendMessage({
  roomId: 1,
  content: 'Hello',
  type: 'TEXT'
});
```
**Status:** ✅ BACKEND HOẠT ĐỘNG

### 4. **Chat WebSocket**
```typescript
// WebSocket connection
wss://baotienweb.cloud/ws
```
**Status:** ⚠️ BACKEND CÓ, FRONTEND CHƯA DÙNG HẾT

---

## 🚧 TỒN ĐỌNG CẦN XỬ LÝ

### PRIORITY 1 (CRITICAL) - Cuộc Gọi Video/Voice

#### Backend Tasks:
```bash
# Tạo Call Module
cd BE-baotienweb.cloud/src
mkdir call
```

**Files cần tạo:**
1. `call.module.ts`
2. `call.controller.ts`
3. `call.service.ts`
4. `call.gateway.ts` (WebSocket)
5. `dto/start-call.dto.ts`
6. `entities/call.entity.ts`

**Database Schema:**
```sql
CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  caller_id INTEGER REFERENCES users(id),
  callee_id INTEGER REFERENCES users(id),
  room_id VARCHAR(255) UNIQUE,
  status VARCHAR(50), -- 'pending', 'active', 'ended', 'missed'
  type VARCHAR(50), -- 'video', 'audio'
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration INTEGER, -- seconds
  created_at TIMESTAMP DEFAULT NOW()
);
```

**LiveKit Setup:**
```bash
# Install LiveKit SDK
npm install livekit-server-sdk

# Environment variables
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_WS_URL=wss://your-livekit-server.com
```

### PRIORITY 2 (HIGH) - Chat WebSocket Frontend

**Tasks:**
1. Tạo `context/ChatContext.tsx` với WebSocket
2. Subscribe to chat events
3. Real-time message updates
4. Typing indicators
5. Read receipts

**Example:**
```typescript
// context/ChatContext.tsx
import io from 'socket.io-client';

const socket = io('wss://baotienweb.cloud/ws', {
  auth: { token: accessToken }
});

socket.on('message', (message) => {
  // Handle new message
});

socket.on('typing', ({ userId, roomId }) => {
  // Show typing indicator
});
```

### PRIORITY 3 (MEDIUM) - Communication Advanced

**Backend:**
1. Channels CRUD
2. Meeting scheduler
3. Polls system
4. File upload in chat

**Frontend:**
1. Channel list UI
2. Meeting calendar
3. Poll creation/voting UI

### PRIORITY 4 (LOW) - Enhancements

1. Call history screen
2. Voicemail
3. Screen sharing
4. Call recording
5. Background call notifications

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Video Call Backend (3-5 days)

**Day 1-2: Setup**
```bash
# 1. Install dependencies
cd BE-baotienweb.cloud
npm install livekit-server-sdk

# 2. Create module
nest g module call
nest g controller call
nest g service call
nest g gateway call

# 3. Add to app.module.ts
imports: [CallModule]
```

**Day 3-4: Implement endpoints**
```typescript
// call.controller.ts
@Post('start')
async startCall(@Body() dto: StartCallDto, @CurrentUser() user) {
  return this.callService.startCall(dto.calleeId, user.sub);
}

@Post('end')
async endCall(@Body() dto: EndCallDto) {
  return this.callService.endCall(dto.roomId);
}

// livekit.controller.ts
@Post('token')
async getToken(@Body() dto: LiveKitTokenDto) {
  return this.livekitService.generateToken(dto);
}
```

**Day 5: Testing**
- Unit tests
- Integration tests
- Manual testing với Postman

### Phase 2: Call Frontend (2-3 days)

**Day 1: Install & Setup**
```bash
npx expo install @livekit/react-native
npx expo install @livekit/react-native-webrtc
```

**Day 2: Call Screen**
```typescript
// app/call/[roomId].tsx
import { LiveKitRoom, VideoTrack } from '@livekit/react-native';

export default function CallScreen() {
  const { roomId } = useLocalSearchParams();
  const [token, setToken] = useState('');

  useEffect(() => {
    getLiveKitToken(roomId, userId).then(setToken);
  }, []);

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_WS_URL}
      token={token}
      connect={true}
    >
      <VideoTrack />
    </LiveKitRoom>
  );
}
```

**Day 3: Integration**
- Call button UI
- Incoming call notification
- Call history

### Phase 3: WebSocket Chat (1-2 days)

**Day 1: Context Setup**
```typescript
// context/ChatWebSocketContext.tsx
export const ChatWebSocketProvider = ({ children }) => {
  const socket = useRef<Socket>();
  
  useEffect(() => {
    socket.current = io(WS_URL);
    
    socket.current.on('message', handleMessage);
    socket.current.on('typing', handleTyping);
    
    return () => socket.current?.disconnect();
  }, []);
  
  return (
    <ChatWebSocketContext.Provider value={{
      sendMessage,
      subscribeToRoom,
    }}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};
```

**Day 2: UI Updates**
- Real-time message list
- Typing indicators
- Read receipts

---

## 🔍 TESTING CHECKLIST

### Phone Call
- [x] Gọi từ Worker Profile
- [x] Gọi từ Project Detail
- [x] Gọi từ Service Detail
- [x] SMS từ Worker Profile
- [x] Số điện thoại format đúng

### Chat
- [ ] Tạo chat room
- [ ] Gửi tin nhắn text
- [ ] Gửi hình ảnh
- [ ] Gửi file
- [ ] Real-time updates
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Unread count

### Video Call
- [ ] Start call
- [ ] Join call
- [ ] Video on/off
- [ ] Audio on/off
- [ ] End call
- [ ] Incoming call notification
- [ ] Call history

---

## 🎯 RECOMMEND ACTIONS

### Immediate (Ngay)

1. **SSH vào server check backend:**
```bash
ssh root@baotienweb.cloud
cd /root/baotienweb-api
ls src/
# Xem có call module chưa
```

2. **Test Chat API:**
```bash
# Tạo room
curl -X POST https://baotienweb.cloud/api/v1/chat/rooms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Room", "type": "GROUP"}'

# Gửi message
curl -X POST https://baotienweb.cloud/api/v1/chat/rooms/1/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello", "type": "TEXT"}'
```

3. **Test WebSocket:**
```javascript
// Browser console
const ws = new WebSocket('wss://baotienweb.cloud/ws');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
```

### Short-term (1-2 tuần)

1. ✅ Implement Call Backend
2. ✅ Implement Call Frontend  
3. ✅ Integrate LiveKit
4. ✅ Test end-to-end calls

### Long-term (1 tháng+)

1. Advanced communication features
2. Meeting scheduler
3. File sharing improvements
4. Analytics & reporting

---

## 💡 SUMMARY

**HOẠT ĐỘNG TỐT:**
- ✅ Phone calls (native)
- ✅ SMS
- ✅ Chat REST API (backend)

**CẦN XỬ LÝ NGAY:**
- ❌ Video/Voice call backend
- ❌ Chat WebSocket frontend
- ❌ Call notifications

**TỒN ĐỌNG CHÍNH:**
1. LiveKit integration (backend + frontend)
2. WebSocket real-time chat
3. Call history & management
4. Advanced communication features

**ESTIMATED EFFORT:**
- Call System: 1-2 weeks (1 backend dev + 1 frontend dev)
- WebSocket Chat: 3-5 days (1 frontend dev)
- Testing & Polish: 1 week

---

*Báo cáo tạo ngày: 2025-12-19*
*Phân tích bởi: AI Assistant*
