# 📞 HỆ THỐNG QUẢN LÝ CUỘC GỌI - IMPLEMENTATION GUIDE

## ✅ ĐÃ HOÀN THÀNH (Phase 1)

### Backend Deployment
- ✅ CallModule deployed to production (baotienweb.cloud)
- ✅ Database migration applied (calls table created)
- ✅ WebSocket gateway operational (`/call` namespace)
- ✅ REST API endpoints available:
  - `POST /api/v1/call/start` - Bắt đầu cuộc gọi
  - `POST /api/v1/call/end` - Kết thúc cuộc gọi
  - `POST /api/v1/call/reject/:callId` - Từ chối cuộc gọi
  - `GET /api/v1/call/history` - Lịch sử cuộc gọi
  - `GET /api/v1/call/active` - Cuộc gọi đang diễn ra
  - `POST /api/v1/call/missed/:callId/read` - Đánh dấu đã đọc

### Frontend Implementation
- ✅ **CallContext** (`context/CallContext.tsx`)
  - WebSocket connection management
  - State management cho cuộc gọi hiện tại
  - Incoming call handling
  - Call history tracking
  - Real-time events: incoming_call, call_accepted, call_rejected, call_ended

- ✅ **UI Components** (`components/call/`)
  - `IncomingCallModal.tsx` - Modal cuộc gọi đến (với animation & vibration)
  - `ActiveCallScreen.tsx` - Màn hình đang gọi (controls: mute, video, speaker)
  - `CallButton.tsx` - Nút gọi nhanh (video/audio)
  - `CallHistoryList.tsx` - Danh sách lịch sử cuộc gọi

- ✅ **Routing**
  - `/call/active` - Full screen modal cho cuộc gọi đang diễn ra
  - `/call-test` - Hidden tab để test functionality

- ✅ **Integration**
  - CallProvider added to app layout (after AuthProvider, before CartProvider)
  - IncomingCallModal globally mounted
  - socket.io-client installed

---

## 🎯 CÁCH SỬ DỤNG

### 1. Tạo Test Users (Trên Server)

```bash
ssh root@103.200.20.100
cd /root/baotienweb-api

# Tạo file script
cat > add-user.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  try {
    // User 1
    const hash1 = await bcrypt.hash('Test123456', 10);
    const user1 = await prisma.user.create({
      data: {
        email: 'testuser@baotienweb.cloud',
        password: hash1,
        name: 'Test User 1',
        role: 'ENGINEER',
        phone: '+84901234567'
      }
    });
    console.log('User 1:', user1.id);

    // User 2
    const hash2 = await bcrypt.hash('Test123456', 10);
    const user2 = await prisma.user.create({
      data: {
        email: 'testuser2@baotienweb.cloud',
        password: hash2,
        name: 'Test User 2',
        role: 'CLIENT',
        phone: '+84907654321'
      }
    });
    console.log('User 2:', user2.id);
    
  } catch (e) {
    if (e.code === 'P2002') {
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: ['testuser@baotienweb.cloud', 'testuser2@baotienweb.cloud']
          }
        }
      });
      console.log('Users exist:', users.map(u => ({ id: u.id, email: u.email })));
    }
  }
  await prisma.$disconnect();
})();
EOF

node add-user.js
```

### 2. Test Backend APIs

```bash
# Login
TOKEN=$(curl -s -X POST https://baotienweb.cloud/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@baotienweb.cloud","password":"Test123456"}' \
  | jq -r '.access_token')

# Start call
curl -X POST https://baotienweb.cloud/api/v1/call/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"calleeId":2,"type":"video"}'

# Get history
curl https://baotienweb.cloud/api/v1/call/history \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Frontend

1. **Đăng nhập với test user**
   - Email: `testuser@baotienweb.cloud`
   - Password: `Test123456`

2. **Mở Call Test Screen**
   ```typescript
   router.push('/(tabs)/call-test');
   ```

3. **Thử gọi**
   - Nhập user ID muốn gọi
   - Nhấn nút video hoặc audio
   - Modal incoming call sẽ xuất hiện ở thiết bị kia

---

## 📱 COMPONENTS USAGE

### CallButton Component

```tsx
import { CallButton } from '@/components/call';

// Video call button
<CallButton 
  userId={2} 
  userName="John Doe" 
  type="video" 
  size="large" 
/>

// Audio call button
<CallButton 
  userId={2} 
  userName="John Doe" 
  type="audio" 
  size="medium" 
/>
```

### CallContext Hook

```tsx
import { useCall } from '@/context/CallContext';

function MyComponent() {
  const { 
    currentCall,      // Cuộc gọi hiện tại
    incomingCall,     // Cuộc gọi đến
    callHistory,      // Lịch sử
    isConnected,      // WebSocket status
    startCall,        // Bắt đầu gọi
    acceptCall,       // Chấp nhận
    rejectCall,       // Từ chối
    endCall,          // Kết thúc
  } = useCall();

  // Start a video call
  const handleCall = async () => {
    try {
      await startCall(userId, 'video');
      router.push('/call/active');
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };
}
```

### CallHistoryList Component

```tsx
import { CallHistoryList } from '@/components/call';

// Show call history
<CallHistoryList />
```

---

## 🔧 ARCHITECTURE

### WebSocket Events

**Client → Server:**
- `register` - Đăng ký user ID khi kết nối
- `call_signal` - WebRTC signaling data
- `accept_call` - Chấp nhận cuộc gọi (temporary, will be REST endpoint)

**Server → Client:**
- `incoming_call` - Cuộc gọi đến
- `call_accepted` - Cuộc gọi được chấp nhận
- `call_rejected` - Cuộc gọi bị từ chối
- `call_ended` - Cuộc gọi kết thúc
- `call_signal` - WebRTC signaling từ peer

### State Flow

```
1. User A starts call → POST /call/start
2. Backend creates call record (status: pending)
3. Backend emits 'incoming_call' to User B via WebSocket
4. User B sees IncomingCallModal
5. User B accepts → emit 'accept_call' → status: active
6. Both users navigate to ActiveCallScreen
7. WebRTC connection established via 'call_signal' events
8. User ends → POST /call/end → status: ended
9. Both users return to previous screen
```

---

## 🚀 NEXT STEPS (Phase 2)

### WebRTC Integration
- [ ] Install `react-native-webrtc` or web equivalent
- [ ] Implement peer connection setup
- [ ] Handle ICE candidates
- [ ] Manage media streams (camera/microphone)
- [ ] Add screen sharing capability

### Enhanced UI
- [ ] Add ringing sound for incoming calls
- [ ] Show caller avatar/photo
- [ ] Call quality indicators
- [ ] Network status display
- [ ] Reconnection handling

### Group Calls (Phase 3)
- [ ] Support multiple participants
- [ ] Grid view layout
- [ ] Speaker view mode
- [ ] Participant list
- [ ] Meeting chat

### Integration with Existing Features
- [ ] Call from chat conversations
- [ ] Call from user profile
- [ ] Call from project team members
- [ ] Notifications for missed calls

---

## 📝 NOTES

### Current Limitations
1. **WebRTC not implemented** - UI placeholder only (need react-native-webrtc)
2. **No actual audio/video** - Requires WebRTC peer connection
3. **Accept call endpoint missing** - Currently using WebSocket emit (should be REST)
4. **No call recording** - Future feature
5. **No push notifications** - For background incoming calls

### Backend Issues to Fix
1. Add `POST /call/accept/:callId` endpoint
2. Add user avatar URLs to call responses
3. Implement call timeout (auto-reject after 30s)
4. Add call quality metrics

### Security Considerations
- JWT token validation on WebSocket connection ✅
- User authorization for calls ✅
- Rate limiting for call creation (TODO)
- TURN/STUN server authentication (TODO)

---

## 🎨 UI/UX Features

### IncomingCallModal
- ✅ Full-screen overlay
- ✅ Caller info display
- ✅ Vibration on incoming call
- ✅ Pulsing animation
- ✅ Accept/Reject buttons
- ✅ Auto-cancel vibration on action

### ActiveCallScreen
- ✅ Remote user avatar placeholder
- ✅ Local video preview (small)
- ✅ Call duration timer
- ✅ Mute/Unmute button
- ✅ Video on/off toggle
- ✅ Speaker mode toggle
- ✅ End call button (prominent)
- ✅ Connection status

### CallHistoryList
- ✅ Incoming/Outgoing indicators
- ✅ Missed call highlighting
- ✅ Call duration display
- ✅ Relative timestamps
- ✅ Call type icons (video/audio)
- ✅ Empty state

---

## 🔗 API ENDPOINTS

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/call/start` | ✅ | Start new call |
| POST | `/api/v1/call/end` | ✅ | End active call |
| POST | `/api/v1/call/reject/:callId` | ✅ | Reject incoming call |
| GET | `/api/v1/call/history` | ✅ | Get call history |
| GET | `/api/v1/call/active` | ✅ | Get active call |
| POST | `/api/v1/call/missed/:callId/read` | ✅ | Mark missed call as read |

**WebSocket Namespace:** `wss://baotienweb.cloud/call`

---

## 📦 Dependencies

```json
{
  "socket.io-client": "^4.x.x"  // ✅ Installed
}
```

**Required for WebRTC (Phase 2):**
```json
{
  "@react-native-webrtc/react-native-webrtc": "^1.x.x",
  "expo-av": "^14.x.x"  // For audio/video permissions
}
```

---

## 🎯 SUCCESS CRITERIA

### Phase 1 (COMPLETED ✅)
- [x] Backend deployed and running
- [x] WebSocket connection established
- [x] Incoming call modal displays
- [x] Call history loaded
- [x] UI components responsive
- [x] Navigation working

### Phase 2 (TODO)
- [ ] WebRTC peer connection works
- [ ] Audio/video streams active
- [ ] Call quality acceptable
- [ ] Reconnection after network issues
- [ ] Works on both iOS and Android

### Phase 3 (TODO)
- [ ] Group calls with 3+ participants
- [ ] Screen sharing functional
- [ ] Meeting chat integrated
- [ ] Recording capability

---

## 🐛 TROUBLESHOOTING

### WebSocket not connecting
```typescript
// Check in CallContext:
console.log('WS URL:', WS_URL);
console.log('Auth token:', user?.token);

// Verify server:
curl -I https://baotienweb.cloud
```

### Incoming call not showing
```typescript
// Check socket events:
socket.on('incoming_call', (call) => {
  console.log('Incoming call received:', call);
});
```

### Call history empty
```bash
# Check backend:
curl https://baotienweb.cloud/api/v1/call/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📞 SUPPORT

- Backend: Deployed on baotienweb.cloud
- Frontend: Expo Router + React Native
- WebSocket: Socket.IO v4
- Database: PostgreSQL with Prisma

**Contact:** Developer Team
**Last Updated:** December 19, 2025
