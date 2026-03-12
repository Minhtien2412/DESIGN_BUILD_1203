# WebRTC Backend Fixes - End-to-End Testing

## 🔍 Vấn đề phát hiện

### 1. ❌ WebSocket Signal Structure Mismatch

**Frontend gửi:**
```typescript
socket.emit('call_signal', {
  callId: number,
  signal: { type: 'offer' | 'answer' | 'ice-candidate', data: any }
});
```

**Backend expect:**
```typescript
data: { to: number; signal: any }
```

**👉 Không match! Backend không biết gửi signal cho ai.**

---

## ✅ Giải pháp

### Fix 1: Sửa Backend Call Gateway

**File:** `BE-baotienweb.cloud/src/call/call.gateway.ts`

Cần sửa `handleCallSignal` để:
1. Lấy `callId` từ frontend
2. Query database để tìm `callerId` và `calleeId`
3. Xác định người nhận (nếu gửi từ caller thì nhận là callee, ngược lại)
4. Forward signal đến đúng user

```typescript
@SubscribeMessage('call_signal')
@UseGuards(WsJwtGuard)
async handleCallSignal(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { callId: number; signal: any },
) {
  const { callId, signal } = data;
  const fromUserId = client.data.userId;
  
  // 1. Query call từ database
  const call = await this.callService.findOne(callId);
  if (!call) {
    console.error(`[CallGateway] Call ${callId} not found`);
    return { success: false, error: 'Call not found' };
  }
  
  // 2. Xác định người nhận
  const toUserId = fromUserId === call.callerId ? call.calleeId : call.callerId;
  
  // 3. Forward signal
  const targetSocketId = this.userSockets.get(toUserId);
  if (targetSocketId) {
    this.server.to(targetSocketId).emit('call_signal', {
      callId,
      signal,
    });
    console.log(`[CallGateway] Forwarded ${signal.type} from user ${fromUserId} to ${toUserId}`);
    return { success: true };
  } else {
    console.error(`[CallGateway] User ${toUserId} not connected`);
    return { success: false, error: 'Recipient not connected' };
  }
}
```

### Fix 2: Inject CallService vào Gateway

**File:** `BE-baotienweb.cloud/src/call/call.gateway.ts`

```typescript
import { CallService } from './call.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/call',
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private callService: CallService) {}
  
  // ... rest of code
}
```

### Fix 3: Thêm findOne method vào CallService (nếu chưa có)

**File:** `BE-baotienweb.cloud/src/call/call.service.ts`

```typescript
async findOne(id: number): Promise<Call> {
  return this.callRepository.findOne({
    where: { id },
  });
}
```

---

## 🔧 Các vấn đề khác cần fix

### 2. ⚠️ CORS Configuration

**Hiện tại:** `origin: '*'` (chấp nhận mọi origin - không an toàn)

**Nên sửa thành:**
```typescript
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:8081',
      'exp://192.168.1.46:8081',
      'https://baotienweb.cloud',
    ],
    credentials: true,
  },
  namespace: '/call',
})
```

### 3. ⚠️ SSL/WSS cho Production

**Hiện tại:** Chạy WS (không mã hóa)

**Cần:**
- Enable HTTPS trên VPS
- WebSocket tự động upgrade lên WSS
- Frontend connect với `wss://baotienweb.cloud`

**Nginx config:**
```nginx
server {
    listen 443 ssl;
    server_name baotienweb.cloud;

    ssl_certificate /etc/letsencrypt/live/baotienweb.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/baotienweb.cloud/privkey.pem;

    # WebSocket upgrade
    location /call {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. ⚠️ TURN Server (Critical cho Production)

**Vấn đề:** STUN servers chỉ hoạt động khi 2 users cùng network hoặc public IP. Qua NAT/Firewall sẽ fail.

**Giải pháp:** Setup TURN server

**Option A: Self-hosted coturn**
```bash
# Install on VPS
sudo apt install coturn

# Config /etc/turnserver.conf
listening-port=3478
external-ip=<VPS_PUBLIC_IP>
realm=baotienweb.cloud
user=turnuser:turnpassword
lt-cred-mech
```

**Option B: Sử dụng service (đơn giản hơn)**
- Twilio TURN: https://www.twilio.com/stun-turn
- Xirsys: https://xirsys.com/
- Metered TURN: https://www.metered.ca/tools/openrelay/

**Update Frontend ICE config:**
```typescript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:baotienweb.cloud:3478',
      username: 'turnuser',
      credential: 'turnpassword',
    },
  ],
};
```

### 5. ⚠️ Auth & Security

**Current issue:** WsJwtGuard có thể chưa verify token đúng

**Kiểm tra:**
```typescript
// ws-jwt.guard.ts phải extract userId từ JWT
canActivate(context: ExecutionContext): boolean | Promise<boolean> {
  const client = context.switchToWs().getClient<Socket>();
  const token = client.handshake.auth.token || client.handshake.headers.authorization;
  
  // Verify JWT và set client.data.userId
  const payload = this.jwtService.verify(token);
  client.data.userId = payload.sub;
  
  return true;
}
```

---

## 📝 Checklist Deploy Backend

### Pre-deployment
- [x] Backend đã có CallModule, CallService, CallGateway
- [ ] Fix `handleCallSignal` để query callId
- [ ] Inject CallService vào Gateway
- [ ] Test locally với 2 devices
- [ ] Add proper CORS origins
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Configure Nginx for WebSocket
- [ ] Setup TURN server (coturn hoặc cloud service)
- [ ] Update frontend ICE servers với TURN credentials

### Deployment Steps

**1. SSH vào VPS**
```bash
ssh root@baotienweb.cloud
cd /var/www/baotienweb.cloud/BE-baotienweb.cloud
```

**2. Pull code mới**
```bash
git pull origin main
```

**3. Install dependencies (nếu có thay đổi)**
```bash
npm install
```

**4. Build TypeScript**
```bash
npm run build
```

**5. Restart PM2**
```bash
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 100
```

**6. Test WebSocket connection**
```bash
# Test từ local machine
wscat -c wss://baotienweb.cloud/call
```

### Post-deployment Testing

**Test 1: WebSocket Connection**
- Frontend connect thành công
- Nhận được event `connect`
- Register user thành công

**Test 2: Call Flow**
- User A start call → User B nhận `incoming_call`
- User B accept → User A nhận `call_accepted`
- WebRTC signaling (offer/answer/ICE) forward đúng

**Test 3: Video/Audio Stream**
- Camera/microphone permissions granted
- Local video stream hiển thị
- Remote video stream hiển thị sau khi connection established
- Audio 2 chiều hoạt động

---

## 🚀 Testing Plan

### Local Testing (Development Build Required)

**Bước 1: Build development build**
```bash
npx expo run:android
# hoặc
eas build --profile development --platform android
```

**Bước 2: Install trên 2 thiết bị**
- Device 1: User A (testuser@baotienweb.cloud)
- Device 2: User B (testuser2@baotienweb.cloud)

**Bước 3: Test flow**
1. Device 1: Login → Navigate to Contacts
2. Device 2: Login → Stay on Home
3. Device 1: Tap video call button on User B
4. Device 2: Popup hiện IncomingCallModal
5. Device 2: Tap Accept
6. Both devices: ActiveCallScreen opens
7. Check: Local video preview (nhỏ, góc trên)
8. Check: Remote video (full screen)
9. Test controls: Mute, Video off, Speaker, Flip camera
10. End call từ 1 device → cả 2 về màn hình trước

### Production Testing

**Requirements:**
- ✅ SSL certificate active
- ✅ WSS connection working
- ✅ TURN server configured
- ✅ 2 devices trên networks khác nhau (test NAT traversal)

---

## 📊 Expected Timeline

| Task | Time | Status |
|------|------|--------|
| Fix Backend handleCallSignal | 30 min | ⏳ Pending |
| Setup SSL/WSS on VPS | 1 hour | ⏳ Pending |
| Setup TURN server | 1-2 hours | ⏳ Pending |
| Build development build | 30 min | ⏳ Pending |
| End-to-end testing | 1 hour | ⏳ Pending |
| Bug fixes | 2-4 hours | ⏳ Pending |
| **Total** | **6-9 hours** | |

---

## 🔗 References

- WebRTC Signaling: https://webrtc.org/getting-started/peer-connections
- Socket.IO Rooms: https://socket.io/docs/v4/rooms/
- coturn Setup: https://github.com/coturn/coturn/wiki/turnserver
- NestJS WebSocket: https://docs.nestjs.com/websockets/gateways

---

## 📌 Next Steps

**Ngay bây giờ:**
1. Sửa Backend CallGateway (handleCallSignal)
2. Deploy lên VPS
3. Test với 2 development builds

**Sau khi test thành công:**
1. Setup TURN server cho production
2. Add error handling & reconnection logic
3. Implement call quality metrics
4. Add call recording (optional)

---

*Document created: 2025-12-19*
*Status: Ready for implementation*
