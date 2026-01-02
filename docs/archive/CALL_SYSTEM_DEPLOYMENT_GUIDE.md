# 🚀 Hướng Dẫn Deploy Hệ Thống Cuộc Gọi

## 📊 Tóm Tắt Tình Trạng Hiện Tại

### ✅ ĐÃ HOÀN THÀNH
1. **Backend Call Module** - 100%
   - ✅ Call Controller (`call.controller.ts`) - REST API endpoints
   - ✅ Call Service (`call.service.ts`) - Business logic
   - ✅ Call Gateway (`call.gateway.ts`) - WebSocket real-time
   - ✅ Call Module (`call.module.ts`) - NestJS module
   - ✅ DTOs (`dto/index.ts`) - Type validation
   - ✅ Prisma Schema - Call model với relations
   - ✅ Migration SQL - Create calls table
   - ✅ User Model Relations - callerCalls, calleeCalls
   - ✅ App Module Integration - CallModule imported

### ⏳ ĐANG PENDING (Cần Deploy)
2. **Database Migration** - Chưa chạy trên server
   - ⏳ Migration file đã có: `20251219_add_calls/migration.sql`
   - ⏳ Cần chạy: `npx prisma migrate deploy`
   - ⏳ Cần generate: `npx prisma generate`

3. **Backend Deployment** - Chưa deploy lên server
   - ⏳ Code đã sẵn sàng local
   - ⏳ Cần copy lên server baotienweb.cloud
   - ⏳ Cần restart PM2 service

### ❌ CHƯA BẮT ĐẦU
4. **Frontend Integration** - 0%
   - ❌ Call Service cần update endpoints
   - ❌ WebSocket call notifications
   - ❌ Incoming call UI
   - ❌ Call history screen
   - ❌ LiveKit video infrastructure

---

## 🎯 Các API Endpoints Đã Tạo

### 1. **POST** `/api/v1/call/start`
**Mô tả:** Bắt đầu cuộc gọi 1-1

**Request:**
```json
{
  "calleeId": 2
}
```

**Response:**
```json
{
  "id": 1,
  "roomId": "call_1_2_1734567890",
  "status": "pending",
  "type": "video",
  "caller": {
    "id": 1,
    "name": "Tiến",
    "email": "tien@example.com"
  },
  "callee": {
    "id": 2,
    "name": "Bảo",
    "email": "bao@example.com"
  }
}
```

### 2. **POST** `/api/v1/call/end`
**Mô tả:** Kết thúc cuộc gọi

**Request:**
```json
{
  "roomId": "call_1_2_1734567890"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "ended",
  "duration": 125,
  "startedAt": "2024-12-19T10:00:00Z",
  "endedAt": "2024-12-19T10:02:05Z"
}
```

### 3. **POST** `/api/v1/call/reject/:callId`
**Mô tả:** Từ chối cuộc gọi

**Response:**
```json
{
  "id": 1,
  "status": "missed"
}
```

### 4. **GET** `/api/v1/call/history`
**Mô tả:** Lịch sử cuộc gọi (50 gần nhất)

**Response:**
```json
[
  {
    "id": 1,
    "type": "video",
    "status": "ended",
    "duration": 125,
    "createdAt": "2024-12-19T10:00:00Z",
    "caller": {
      "id": 1,
      "name": "Tiến",
      "email": "tien@example.com"
    },
    "callee": {
      "id": 2,
      "name": "Bảo",
      "email": "bao@example.com"
    }
  }
]
```

### 5. **GET** `/api/v1/call/active`
**Mô tả:** Cuộc gọi đang active

**Response:**
```json
{
  "id": 2,
  "roomId": "call_1_3_1734570000",
  "status": "active",
  "type": "video",
  "startedAt": "2024-12-19T10:30:00Z"
}
```

---

## 🌐 WebSocket Events

### Namespace: `/call`

#### Client → Server Events

**1. `join_call`**
```typescript
socket.emit('join_call', {
  roomId: 'call_1_2_1734567890'
});
```

**2. `call_signal`**
```typescript
// WebRTC signaling (offer/answer/ice-candidate)
socket.emit('call_signal', {
  to: 2,
  signal: {
    type: 'offer',
    sdp: '...'
  }
});
```

#### Server → Client Events

**1. `incoming_call`**
```typescript
socket.on('incoming_call', (data) => {
  console.log('Incoming call from:', data.caller.name);
  // Show incoming call UI
});

// Data structure:
{
  callId: 1,
  roomId: 'call_1_2_1734567890',
  caller: {
    id: 1,
    name: 'Tiến',
    email: 'tien@example.com'
  }
}
```

**2. `call_accepted`**
```typescript
socket.on('call_accepted', (data) => {
  console.log('Call accepted by:', data.callee.name);
  // Start WebRTC connection
});
```

**3. `call_rejected`**
```typescript
socket.on('call_rejected', (data) => {
  console.log('Call rejected');
  // Show rejected message
});
```

**4. `call_ended`**
```typescript
socket.on('call_ended', (data) => {
  console.log('Call ended. Duration:', data.duration);
  // Clean up connection
});
```

---

## 📦 Database Schema

### Bảng `calls`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | SERIAL | - | Primary key |
| `callerId` | INTEGER | - | User ID người gọi |
| `calleeId` | INTEGER | - | User ID người nhận |
| `roomId` | VARCHAR(255) | - | Unique room ID |
| `status` | VARCHAR(50) | 'pending' | pending/active/ended/missed |
| `type` | VARCHAR(50) | 'video' | video/audio |
| `startedAt` | TIMESTAMP | NULL | Thời gian bắt đầu |
| `endedAt` | TIMESTAMP | NULL | Thời gian kết thúc |
| `duration` | INTEGER | NULL | Thời lượng (giây) |
| `createdAt` | TIMESTAMP | NOW() | Thời gian tạo |
| `updatedAt` | TIMESTAMP | - | Thời gian update |

**Foreign Keys:**
- `callerId` → `users.id`
- `calleeId` → `users.id`

**Indexes:**
- `callerId` (for history queries)
- `calleeId` (for history queries)
- `status` (for active call queries)
- `createdAt` (for ordering)
- `roomId` (UNIQUE)

---

## 🛠️ Các Bước Deploy Lên Server

### Bước 1: Test Local (Optional)

```powershell
# Chuyển vào thư mục backend
cd BE-baotienweb.cloud

# Generate Prisma client
npx prisma generate

# Test migration locally (nếu có local DB)
npx prisma migrate dev --name add_calls

# Build NestJS
npm run build

# Start local
npm run start:dev
```

### Bước 2: SSH vào Server

```bash
ssh root@baotienweb.cloud
# hoặc
ssh root@103.226.250.71
```

### Bước 3: Backup Code Hiện Tại

```bash
cd /root/baotienweb-api
# Backup
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz src/ prisma/

# Hoặc commit git
git add .
git commit -m "Backup before call module deployment"
```

### Bước 4: Copy Files Lên Server

**Option A: Qua Git (Recommended)**
```bash
# Trên local
cd C:\tien\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud
git add .
git commit -m "Add Call module - video/audio calling system"
git push origin main

# Trên server
cd /root/baotienweb-api
git pull origin main
```

**Option B: Qua SCP**
```powershell
# Trên local Windows
cd C:\tien\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud

# Copy call module
scp -r src/call root@baotienweb.cloud:/root/baotienweb-api/src/

# Copy updated app.module.ts
scp src/app.module.ts root@baotienweb.cloud:/root/baotienweb-api/src/

# Copy updated schema.prisma
scp prisma/schema.prisma root@baotienweb.cloud:/root/baotienweb-api/prisma/

# Copy migration
scp -r prisma/migrations/20251219_add_calls root@baotienweb.cloud:/root/baotienweb-api/prisma/migrations/
```

### Bước 5: Install Dependencies (nếu cần)

```bash
cd /root/baotienweb-api
npm install
```

### Bước 6: Run Migration

```bash
cd /root/baotienweb-api

# Kiểm tra migration
npx prisma migrate status

# Deploy migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Bước 7: Build Backend

```bash
npm run build
```

### Bước 8: Restart PM2

```bash
# Restart backend service
pm2 restart baotienweb-api

# Hoặc nếu chưa có process
pm2 start dist/main.js --name baotienweb-api

# Kiểm tra logs
pm2 logs baotienweb-api

# Kiểm tra status
pm2 status
```

### Bước 9: Verify Deployment

```bash
# Test health endpoint
curl https://baotienweb.cloud/api/health

# Test call endpoints (cần token)
curl https://baotienweb.cloud/api/v1/call/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Testing Checklist

### Backend API Tests

```bash
# 1. Get auth token first
TOKEN=$(curl -X POST https://baotienweb.cloud/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}' \
  | jq -r '.access_token')

# 2. Start call
curl -X POST https://baotienweb.cloud/api/v1/call/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"calleeId": 2}'

# 3. Get call history
curl https://baotienweb.cloud/api/v1/call/history \
  -H "Authorization: Bearer $TOKEN"

# 4. Get active call
curl https://baotienweb.cloud/api/v1/call/active \
  -H "Authorization: Bearer $TOKEN"

# 5. End call
curl -X POST https://baotienweb.cloud/api/v1/call/end \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roomId": "ROOM_ID_FROM_STEP_2"}'
```

### WebSocket Connection Test

```javascript
// Test with browser console or Node.js
const io = require('socket.io-client');

const socket = io('wss://baotienweb.cloud/call', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to call namespace');
});

socket.on('incoming_call', (data) => {
  console.log('📞 Incoming call:', data);
});

socket.emit('join_call', {
  roomId: 'call_1_2_1734567890'
});
```

---

## 🎨 Frontend Integration (Tiếp Theo)

### 1. Update Call Service

**File:** `services/call.ts`

```typescript
import { apiFetch } from './api';
import io, { Socket } from 'socket.io-client';

class CallService {
  private socket: Socket | null = null;

  // Connect to WebSocket
  connectWebSocket(token: string) {
    this.socket = io('wss://baotienweb.cloud/call', {
      auth: { token }
    });

    this.socket.on('incoming_call', this.handleIncomingCall);
    this.socket.on('call_accepted', this.handleCallAccepted);
    this.socket.on('call_rejected', this.handleCallRejected);
    this.socket.on('call_ended', this.handleCallEnded);
  }

  // Start call
  async startCall(calleeId: number) {
    return apiFetch('/call/start', {
      method: 'POST',
      body: JSON.stringify({ calleeId })
    });
  }

  // End call
  async endCall(roomId: string) {
    return apiFetch('/call/end', {
      method: 'POST',
      body: JSON.stringify({ roomId })
    });
  }

  // Get history
  async getCallHistory() {
    return apiFetch('/call/history');
  }

  // Event handlers
  private handleIncomingCall = (data: any) => {
    // Show incoming call modal
    console.log('Incoming call from:', data.caller.name);
  };

  private handleCallAccepted = (data: any) => {
    // Navigate to call screen
  };

  private handleCallRejected = (data: any) => {
    // Show rejected message
  };

  private handleCallEnded = (data: any) => {
    // Navigate back, show duration
  };
}

export const callService = new CallService();
```

### 2. Create Call Context

**File:** `context/CallContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { callService } from '@/services/call';
import { useAuth } from './AuthContext';

interface CallContextValue {
  incomingCall: any | null;
  activeCall: any | null;
  startCall: (calleeId: number) => Promise<void>;
  endCall: () => Promise<void>;
  acceptCall: () => void;
  rejectCall: () => void;
}

const CallContext = createContext<CallContextValue | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    if (user?.token) {
      callService.connectWebSocket(user.token);
    }
  }, [user]);

  // Implementation...
  
  return (
    <CallContext.Provider value={{...}}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be within CallProvider');
  return context;
};
```

### 3. Incoming Call Modal

**File:** `components/IncomingCallModal.tsx`

```typescript
import React from 'react';
import { Modal, View, Text, Image } from 'react-native';
import { Button } from './ui/button';
import { useCall } from '@/context/CallContext';

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useCall();

  if (!incomingCall) return null;

  return (
    <Modal visible={true} animationType="slide">
      <View className="flex-1 bg-black/90 justify-center items-center">
        <Image 
          source={{ uri: incomingCall.caller.avatar }} 
          className="w-32 h-32 rounded-full mb-4"
        />
        <Text className="text-white text-2xl font-bold mb-2">
          {incomingCall.caller.name}
        </Text>
        <Text className="text-gray-300 mb-8">
          Cuộc gọi {incomingCall.type === 'video' ? 'video' : 'thoại'}...
        </Text>
        
        <View className="flex-row gap-6">
          <Button 
            variant="destructive" 
            onPress={rejectCall}
            className="w-20 h-20 rounded-full"
          >
            ❌
          </Button>
          <Button 
            variant="default" 
            onPress={acceptCall}
            className="w-20 h-20 rounded-full bg-green-500"
          >
            📞
          </Button>
        </View>
      </View>
    </Modal>
  );
};
```

### 4. Update App Layout

**File:** `app/_layout.tsx`

```typescript
import { CallProvider } from '@/context/CallContext';
import { IncomingCallModal } from '@/components/IncomingCallModal';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <CartProvider>
          <CallProvider>
            <Stack>
              {/* routes */}
            </Stack>
            <IncomingCallModal />
          </CallProvider>
        </CartProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}
```

---

## 📋 Roadmap Hoàn Thiện

### Phase 1: Backend Deployment (1-2 ngày) - ⏳ ĐANG LÀM
- [x] ✅ Tạo Call module structure
- [x] ✅ Tạo Prisma schema & migration
- [x] ✅ Update User model relations
- [x] ✅ Import CallModule vào app.module.ts
- [ ] ⏳ Deploy lên server
- [ ] ⏳ Run migration trên production DB
- [ ] ⏳ Test API endpoints

### Phase 2: Frontend Integration (3-5 ngày)
- [ ] Update call service
- [ ] Create CallContext
- [ ] Implement IncomingCallModal
- [ ] Create call history screen
- [ ] WebSocket connection handling
- [ ] Error handling & retry logic

### Phase 3: Video Infrastructure (1-2 tuần)
- [ ] Setup LiveKit Cloud
- [ ] Integrate LiveKit SDK
- [ ] Implement WebRTC signaling
- [ ] Video/Audio controls
- [ ] Screen sharing
- [ ] Call quality monitoring

### Phase 4: Polish & Testing (1 tuần)
- [ ] UI/UX improvements
- [ ] Notification sounds
- [ ] Vibration patterns
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Documentation

---

## ⚠️ Important Notes

### Security
- ✅ JWT authentication on all endpoints
- ✅ WebSocket auth with token
- ❌ TODO: Rate limiting for call start
- ❌ TODO: Spam prevention (max calls per hour)

### Performance
- ✅ Database indexes on callerId, calleeId, status
- ✅ Limit history to 50 calls
- ❌ TODO: Pagination for call history
- ❌ TODO: Cache active call status

### Error Handling
- ✅ 404 if call not found
- ✅ 403 if not authorized to end call
- ✅ 409 if user already in another call
- ❌ TODO: Retry logic on WebSocket disconnect

### Monitoring
- ❌ TODO: Call metrics (duration, success rate)
- ❌ TODO: Error tracking (Sentry)
- ❌ TODO: Performance monitoring (New Relic)
- ❌ TODO: Alert on high failed call rate

---

## 🆘 Troubleshooting

### Issue 1: Migration fails
```
Error: Table 'calls' already exists
```
**Solution:**
```bash
# Drop table manually
psql -d postgres -c "DROP TABLE calls CASCADE;"
# Then re-run migration
npx prisma migrate deploy
```

### Issue 2: WebSocket không connect
```
socket.io connection timeout
```
**Solution:**
- Kiểm tra firewall cho WebSocket port
- Verify nginx config cho WebSocket upgrade
- Check PM2 logs: `pm2 logs baotienweb-api`

### Issue 3: Call không tạo được
```
409 Conflict: User already in another call
```
**Solution:**
- Kiểm tra active call: `GET /api/v1/call/active`
- End call cũ trước khi start mới
- Clear orphaned active calls trong DB

---

## 📞 Support

- **Backend Issues:** Check PM2 logs
- **Database Issues:** Check PostgreSQL logs
- **WebSocket Issues:** Use Socket.IO debugging
- **Frontend Issues:** Check React Native logs

**PM2 Commands:**
```bash
pm2 logs baotienweb-api --lines 100
pm2 restart baotienweb-api
pm2 monit
```

**PostgreSQL Commands:**
```bash
psql -d postgres
\dt calls
SELECT * FROM calls ORDER BY "createdAt" DESC LIMIT 10;
```

---

## ✅ Deployment Checklist

Trước khi deploy production:

- [ ] Đã test local với migration
- [ ] Đã backup code & database hiện tại
- [ ] Đã review tất cả code changes
- [ ] Đã update .env với config mới (nếu cần)
- [ ] Đã test WebSocket connection
- [ ] Đã test tất cả API endpoints
- [ ] Đã update API documentation
- [ ] Đã notify team về downtime (nếu có)

Sau khi deploy:

- [ ] Migration chạy thành công
- [ ] PM2 service restart không lỗi
- [ ] Health check endpoint trả về 200
- [ ] Call endpoints hoạt động bình thường
- [ ] WebSocket connect được
- [ ] Không có error trong logs
- [ ] Frontend kết nối được backend
- [ ] Test end-to-end flow

---

**Tài liệu này được tạo:** 19/12/2024
**Version:** 1.0
**Author:** GitHub Copilot
**Status:** ⏳ Pending Backend Deployment
