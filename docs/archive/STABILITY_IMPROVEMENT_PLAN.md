# 🎯 App Stability Improvement Plan - Phương án tối ưu

**Mục tiêu:** App hoạt động ổn định, không lỗi, tính năng hoàn chỉnh

---

## ✅ Phương pháp được chọn: **Incremental Stability Approach**

### Giai đoạn 1: Fix Critical Issues (1 giờ) 🔴 PRIORITIZE

#### 1.1. Fix Notification 404 ✅ DONE
- Changed endpoints to `/api/v1/notifications`
- Fixed HTTP methods (PATCH)
- **Status:** Đã hoàn thành

#### 1.2. Deploy Backend WebRTC Fixes (30 phút) ⏳ NEXT
**Tại sao quan trọng:**
- Backend có bugs signaling
- Video call không hoạt động đúng
- Cần sửa trước khi test

**Cách làm an toàn hơn:**
```powershell
# Option 1: Manual deployment (nếu script fail)
# Step 1: Connect to VPS
ssh root@baotienweb.cloud

# Step 2: Navigate to project
cd /var/www/baotienweb.cloud/BE-baotienweb.cloud

# Step 3: Pull latest code (if Git)
# OR copy files manually with WinSCP

# Step 4: Build
npm install
npm run build

# Step 5: Restart
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 50
```

**Option 2: Check what failed first**
```powershell
# Test SSH connection
ssh root@baotienweb.cloud "echo Connected successfully"

# If SSH works, check file paths
ssh root@baotienweb.cloud "ls -la /var/www/baotienweb.cloud/BE-baotienweb.cloud/src/call/"

# Check if files exist locally
Test-Path BE-baotienweb.cloud\src\call\call.service.ts
Test-Path BE-baotienweb.cloud\src\call\call.gateway.ts
```

#### 1.3. Test Endpoints (15 phút)
```bash
# Test notification endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://baotienweb.cloud/api/v1/notifications

# Test call history
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://baotienweb.cloud/api/v1/call/history

# Expected: 200 OK (not 404)
```

#### 1.4. Verify App Stability (15 phút)
- [ ] No 404 errors in console
- [ ] Notifications load correctly
- [ ] No infinite loops
- [ ] No crashes on navigation

---

### Giai đoạn 2: Add Real-time Infrastructure (2 giờ) 🟡 HIGH IMPACT

#### 2.1. Create Notifications WebSocket Gateway (Backend - 1 giờ)

**File:** `BE-baotienweb.cloud/src/notifications/notifications.gateway.ts`

```typescript
import { 
  WebSocketGateway, 
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '@/auth/guards/ws-jwt.guard';

@WebSocketGateway({ 
  namespace: '/notifications',
  cors: { origin: '*' }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  // Map userId to socketIds (a user can have multiple devices)
  private userSockets = new Map<number, Set<string>>();

  handleConnection(client: Socket) {
    console.log(`[NotificationsGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[NotificationsGateway] Client disconnected: ${client.id}`);
    // Remove from all user mappings
    this.userSockets.forEach((sockets, userId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { userId: number }) {
    const { userId } = payload;
    
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    
    console.log(`[NotificationsGateway] User ${userId} registered on socket ${client.id}`);
    client.emit('registered', { success: true });
  }

  // Called by NotificationsService when creating notification
  sendToUser(userId: number, notification: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('notification', notification);
      });
      console.log(`[NotificationsGateway] Sent notification to user ${userId} (${socketIds.size} devices)`);
    } else {
      console.log(`[NotificationsGateway] User ${userId} not connected`);
    }
  }

  // Broadcast to all users (for system notifications)
  broadcast(notification: any) {
    this.server.emit('broadcast_notification', notification);
  }
}
```

**Update NotificationsModule:**
```typescript
// BE-baotienweb.cloud/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
```

**Update NotificationsService to use Gateway:**
```typescript
// BE-baotienweb.cloud/src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: any) {
    // Save to database
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
    });

    // Send via WebSocket immediately
    this.notificationsGateway.sendToUser(
      createNotificationDto.userId,
      notification
    );

    return notification;
  }
}
```

#### 2.2. Connect Frontend to Notifications WebSocket (1 giờ)

**Update NotificationContext:**
```typescript
// context/NotificationContext.tsx
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ENV } from '@/config/env';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  
  // ... existing state ...

  // WebSocket connection
  useEffect(() => {
    if (!user || !token) return;

    const socket = io(`${ENV.WS_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[Notifications] WebSocket connected');
      socket.emit('register', { userId: user.id });
    });

    socket.on('registered', () => {
      console.log('[Notifications] Registered for real-time notifications');
    });

    socket.on('notification', (notification: Notification) => {
      console.log('[Notifications] Received real-time notification:', notification);
      
      // Add to state
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast
      showNotificationToast(notification);
      
      // Play sound (optional)
      // playNotificationSound();
    });

    socket.on('disconnect', () => {
      console.log('[Notifications] WebSocket disconnected');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  // Helper to show toast
  const showNotificationToast = (notification: Notification) => {
    // Use expo-toast or react-native-toast-message
    Toast.show({
      type: notification.type === 'error' ? 'error' : 'info',
      text1: notification.title,
      text2: notification.message,
      position: 'top',
      visibilityTime: 4000,
    });
  };

  // ... rest of context ...
}
```

---

### Giai đoạn 3: Testing & Validation (30 phút) 🟢

#### 3.1. Test Real-time Notifications
```bash
# Terminal 1: Monitor backend logs
ssh root@baotienweb.cloud 'pm2 logs baotienweb-api --lines 100'

# Terminal 2: Create test notification via API
curl -X POST https://baotienweb.cloud/api/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 22,
    "type": "info",
    "title": "Test Notification",
    "message": "This is a real-time test",
    "priority": "normal"
  }'

# Expected: Notification appears instantly in app (no refresh needed)
```

#### 3.2. Stability Checklist
- [ ] WebSocket connects successfully
- [ ] Notifications arrive in real-time
- [ ] Toast shows correctly
- [ ] Badge count updates
- [ ] No memory leaks (disconnect cleanup)
- [ ] Works on web, Android, iOS

---

## 📊 So sánh các phương pháp

| Phương pháp | Thời gian | Độ phức tạp | Lợi ích ngay | Độ ổn định |
|-------------|-----------|-------------|--------------|-----------|
| **A. Deploy WebRTC** | 30 phút | Thấp | ⭐⭐ | ⭐⭐⭐ |
| **B. Notifications WebSocket** | 2 giờ | Trung bình | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **C. LiveKit** | 4 giờ | Cao | ⭐⭐⭐ | ⭐⭐⭐ |
| **D. Chat UI** | 6 giờ | Cao | ⭐⭐⭐⭐ | ⭐⭐ |
| **A + B (Recommend)** | 2.5 giờ | Trung bình | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Kế hoạch triển khai (Recommended)

### ⏰ Hôm nay (2.5 giờ):
```
09:00 - 09:30  → Fix deploy script & deploy WebRTC
09:30 - 10:00  → Test endpoints, verify stability
10:00 - 11:00  → Create Notifications Gateway (backend)
11:00 - 12:00  → Connect frontend to WebSocket
12:00 - 12:30  → Test real-time notifications
```

### 🔄 Tuần sau:
- LiveKit integration (video conferencing)
- Chat UI screens
- Additional features

---

## ✅ Lợi ích của phương pháp A + B:

1. **Stability First** 🛡️
   - Fix critical bugs (WebRTC)
   - No more 404 errors
   - Real-time infrastructure

2. **User Experience** 🎨
   - Instant notifications
   - No need to refresh
   - Professional feel

3. **Foundation for Future** 🏗️
   - Real-time infrastructure ready
   - Easy to add Chat WebSocket later
   - Scalable architecture

4. **Low Risk** ⚠️
   - Incremental changes
   - Test each step
   - Easy rollback

5. **High Impact** 💪
   - Users see immediate improvement
   - App feels responsive
   - Ready for production

---

## 🚀 Bắt đầu ngay

**Bước 1: Kiểm tra deploy script**
```powershell
# Check SSH connection
ssh root@baotienweb.cloud "echo Connected"

# Check backend files exist
Test-Path BE-baotienweb.cloud\src\call\call.service.ts
```

**Bước 2: Deploy (nếu OK)**
```powershell
.\deploy-backend-webrtc.ps1
```

**Bước 3: Nếu script fail, deploy thủ công**
```powershell
# Connect to VPS
ssh root@baotienweb.cloud

# Navigate and rebuild
cd /var/www/baotienweb.cloud/BE-baotienweb.cloud
npm run build
pm2 restart baotienweb-api
```

---

**Ready to start?** Chúng ta bắt đầu với việc kiểm tra tại sao deploy script fail trước nhé! 🎯
