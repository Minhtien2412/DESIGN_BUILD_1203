# ✅ Checklist Triển Khai Hệ Thống Cuộc Gọi

## 🎯 Tóm Tắt Nhanh

**Tình trạng hiện tại:**
- ✅ Backend code hoàn thành 90%
- ⏳ Chờ deploy lên server
- ❌ Frontend chưa bắt đầu

**Thời gian:**
- Deploy backend: 2-3 giờ
- Frontend integration: 1-2 tuần
- Total ready: 2-3 tuần

---

## 📋 Phase 1: Backend Deployment (HÔM NAY)

### Prerequisites ✅
- [x] Call controller created
- [x] Call service created
- [x] Call gateway created
- [x] Call module created
- [x] DTOs created
- [x] Prisma schema updated
- [x] Migration file created
- [x] User relations added
- [x] CallModule imported to app.module.ts

### Deploy Steps ⏳
- [ ] **1. SSH vào server**
  ```bash
  ssh root@baotienweb.cloud
  ```

- [ ] **2. Backup code hiện tại**
  ```bash
  cd /root/baotienweb-api
  tar -czf backup-$(date +%Y%m%d).tar.gz src/ prisma/
  ```

- [ ] **3. Pull/copy code mới**
  ```bash
  git pull origin main
  # hoặc scp files từ local
  ```

- [ ] **4. Install dependencies (nếu cần)**
  ```bash
  npm install
  ```

- [ ] **5. Run migration**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **6. Generate Prisma client**
  ```bash
  npx prisma generate
  ```

- [ ] **7. Build NestJS**
  ```bash
  npm run build
  ```

- [ ] **8. Restart PM2**
  ```bash
  pm2 restart baotienweb-api
  ```

- [ ] **9. Check logs**
  ```bash
  pm2 logs baotienweb-api --lines 50
  ```

### Testing ⏳
- [ ] **Health check**
  ```bash
  curl https://baotienweb.cloud/api/health
  ```

- [ ] **Get JWT token**
  ```bash
  TOKEN=$(curl -X POST https://baotienweb.cloud/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"yourpass"}' \
    | jq -r '.access_token')
  ```

- [ ] **Test call history endpoint**
  ```bash
  curl https://baotienweb.cloud/api/v1/call/history \
    -H "Authorization: Bearer $TOKEN"
  ```

- [ ] **Test start call endpoint**
  ```bash
  curl -X POST https://baotienweb.cloud/api/v1/call/start \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"calleeId": 2}'
  ```

- [ ] **Test WebSocket connection**
  - Dùng tool: [WebSocket King](https://websocketking.com/)
  - URL: `wss://baotienweb.cloud/call`
  - Auth: Include JWT token

---

## 📋 Phase 2: Frontend Call Service (TUẦN 1)

### Day 1-2: Core Service ❌
- [ ] **Update `services/call.ts`**
  - [ ] Add REST API methods (startCall, endCall, getHistory)
  - [ ] Add Socket.IO client setup
  - [ ] Add WebSocket event handlers
  - [ ] Add error handling

- [ ] **Create `context/CallContext.tsx`**
  - [ ] Define CallContext interface
  - [ ] Implement CallProvider
  - [ ] Add state management (incomingCall, activeCall)
  - [ ] Add methods (startCall, acceptCall, rejectCall, endCall)

- [ ] **Update `app/_layout.tsx`**
  - [ ] Import CallProvider
  - [ ] Wrap app with CallProvider
  - [ ] Ensure proper provider order

### Day 3: WebSocket Integration ❌
- [ ] **Install Socket.IO client**
  ```bash
  npm install socket.io-client
  ```

- [ ] **Connect to WebSocket**
  - [ ] Create socket connection
  - [ ] Add authentication
  - [ ] Handle connection events
  - [ ] Handle disconnection
  - [ ] Add reconnection logic

- [ ] **Listen to events**
  - [ ] incoming_call
  - [ ] call_accepted
  - [ ] call_rejected
  - [ ] call_ended

### Day 4-5: UI Components ❌
- [ ] **Create `components/IncomingCallModal.tsx`**
  - [ ] Fullscreen modal overlay
  - [ ] Display caller info (name, avatar)
  - [ ] Show call type (video/audio)
  - [ ] Add Accept button
  - [ ] Add Reject button
  - [ ] Add ringtone sound
  - [ ] Add vibration

- [ ] **Create `components/CallButton.tsx`**
  - [ ] Video call button
  - [ ] Audio call button
  - [ ] Handle press events
  - [ ] Loading states

- [ ] **Update worker profile screens**
  - [ ] Add call buttons
  - [ ] Wire up to CallContext

---

## 📋 Phase 3: LiveKit Video (TUẦN 2)

### Day 1: LiveKit Setup ❌
- [ ] **Sign up for LiveKit**
  - [ ] Create account at livekit.io
  - [ ] Get API key & secret
  - [ ] Configure project

- [ ] **Install packages**
  ```bash
  npm install @livekit/react-native-webrtc @livekit/react-native
  ```

- [ ] **Backend LiveKit token generation**
  - [ ] Add LiveKit SDK to backend
  - [ ] Create token generation endpoint
  - [ ] Add to call start flow

### Day 2-4: Call Screen ❌
- [ ] **Create `app/(call)/call-screen.tsx`**
  - [ ] Setup LiveKitRoom component
  - [ ] Add local video preview
  - [ ] Add remote video view
  - [ ] Add mute/unmute button
  - [ ] Add camera on/off button
  - [ ] Add camera flip button
  - [ ] Add speaker toggle
  - [ ] Add end call button

- [ ] **Handle navigation**
  - [ ] Navigate to call screen on accept
  - [ ] Pass room token
  - [ ] Handle back press
  - [ ] Clean up on unmount

### Day 5: Call History ❌
- [ ] **Create `app/(tabs)/call-history.tsx`**
  - [ ] Fetch call history from API
  - [ ] Display list with FlatList
  - [ ] Show call type icon
  - [ ] Show duration
  - [ ] Show missed/answered status
  - [ ] Add "Call back" button
  - [ ] Pull to refresh

---

## 📋 Phase 4: Chat WebSocket (3 NGÀY)

### Day 1: Setup ❌
- [ ] **Create `context/ChatWebSocketContext.tsx`**
  - [ ] Socket.IO connection
  - [ ] Authentication
  - [ ] Event handlers

### Day 2: Integration ❌
- [ ] **Update chat screens**
  - [ ] Listen to message_received
  - [ ] Update UI in real-time
  - [ ] Emit send_message
  - [ ] Handle typing indicator

### Day 3: Polish ❌
- [ ] **Read status**
  - [ ] Mark messages as read
  - [ ] Show delivery status

- [ ] **Online status**
  - [ ] Show user online/offline
  - [ ] Last seen timestamp

---

## 📋 Phase 5: Testing & Polish (1 TUẦN)

### Testing ❌
- [ ] **Manual testing**
  - [ ] Test on 2 real devices
  - [ ] Test incoming call notification
  - [ ] Test accept/reject flow
  - [ ] Test video quality
  - [ ] Test audio quality
  - [ ] Test network switching (WiFi ↔ 4G)
  - [ ] Test background/foreground

- [ ] **Edge cases**
  - [ ] Multiple incoming calls
  - [ ] Call while already in call
  - [ ] Network disconnection during call
  - [ ] Battery optimization killing app
  - [ ] Permission denied scenarios

### Polish ❌
- [ ] **UI improvements**
  - [ ] Custom ringtone
  - [ ] Better animations
  - [ ] Dark mode support
  - [ ] Accessibility labels

- [ ] **Performance**
  - [ ] Optimize video bitrate
  - [ ] Reduce latency
  - [ ] Battery optimization

- [ ] **Error handling**
  - [ ] Friendly error messages
  - [ ] Retry logic
  - [ ] Fallback to audio only

---

## 🎯 Quick Reference

### Files Changed (Backend) ✅
```
BE-baotienweb.cloud/
├── src/
│   ├── call/              ✅ NEW
│   │   ├── call.controller.ts
│   │   ├── call.service.ts
│   │   ├── call.gateway.ts
│   │   ├── call.module.ts
│   │   └── dto/index.ts
│   └── app.module.ts      ✅ UPDATED
├── prisma/
│   ├── schema.prisma      ✅ UPDATED
│   └── migrations/
│       └── 20251219_add_calls/  ✅ NEW
```

### Files to Create (Frontend) ❌
```
APP_DESIGN_BUILD05.12.2025/
├── services/
│   └── call.ts            ❌ UPDATE
├── context/
│   ├── CallContext.tsx    ❌ NEW
│   └── ChatWebSocketContext.tsx  ❌ NEW
├── components/
│   ├── IncomingCallModal.tsx     ❌ NEW
│   └── CallButton.tsx     ❌ NEW
└── app/
    ├── (call)/
    │   └── call-screen.tsx  ❌ NEW
    └── (tabs)/
        └── call-history.tsx  ❌ NEW
```

### API Endpoints Ready ✅
- `POST /api/v1/call/start`
- `POST /api/v1/call/end`
- `POST /api/v1/call/reject/:id`
- `GET /api/v1/call/history`
- `GET /api/v1/call/active`

### WebSocket Ready ✅
- Namespace: `/call`
- Events: incoming_call, call_accepted, call_rejected, call_ended

---

## 🚀 Next Action

**IMMEDIATE (Hôm nay):**
```bash
# Deploy backend
ssh root@baotienweb.cloud
cd /root/baotienweb-api
git pull origin main
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart baotienweb-api
```

**THIS WEEK:**
1. Test backend endpoints
2. Start frontend CallContext
3. Create IncomingCallModal

**NEXT WEEK:**
1. LiveKit integration
2. Call screen implementation
3. Testing with real devices

---

**Created:** 19/12/2024  
**Status:** ⏳ Backend ready for deployment  
**ETA:** 2-3 weeks for full production
