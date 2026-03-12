# 🎯 IMMEDIATE ACTION PLAN - App Stability

**Mục tiêu:** App hoạt động ổn định trong 2-3 giờ

---

## ✅ ĐÃ HOÀN THÀNH (10 phút trước)

1. **Fixed Notification 404 Error**
   - Updated endpoints: `/api/notifications` → `/api/v1/notifications`
   - Changed HTTP method: `POST` → `PATCH` for mark as read
   - **Status:** ✅ Ready to test

2. **Fixed Call Endpoints**
   - Updated to `/api/v1/call/history`
   - Aligned with backend structure
   - **Status:** ✅ Ready to test

---

## 🚀 PHƯƠNG ÁN TỐI ƯU: Option B (Notifications WebSocket)

**Tại sao chọn Option B thay vì A?**

### ❌ Problems với Option A (Deploy WebRTC):
1. Deploy script thất bại → cần debug SSH/VPS
2. Phụ thuộc vào server access (có thể có vấn đề network)
3. Cần test trên 2 physical devices (không có sẵn)
4. WebRTC đã hoạt động cơ bản, chỉ thiếu một vài fix nhỏ

### ✅ Advantages của Option B (Notifications WebSocket):
1. **Không cần deploy backend ngay** - làm local testing trước
2. **High visibility improvement** - Users thấy ngay notifications real-time
3. **Foundation cho nhiều features** - Chat, Live updates cùng dùng WebSocket
4. **Low risk** - Không động vào VPS, chỉ code frontend + backend local
5. **Testable ngay** - Dùng web browser để test

---

## 📋 IMPLEMENTATION PLAN (2 giờ)

### Bước 1: Backend - Notifications Gateway (45 phút)

**File 1:** `BE-baotienweb.cloud/src/notifications/notifications.gateway.ts`

```typescript
import { 
  WebSocketGateway, 
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ 
  namespace: '/notifications',
  cors: { origin: '*', credentials: true }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);
  
  // Map: userId -> Set of socketIds (multiple devices per user)
  private userSockets = new Map<number, Set<string>>();

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { socketId: client.id, timestamp: new Date() });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove from all user mappings
    this.userSockets.forEach((sockets, userId) => {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        this.logger.log(`Removed socket ${client.id} from user ${userId}`);
        
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          this.logger.log(`User ${userId} fully disconnected`);
        }
      }
    });
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: number }
  ) {
    const { userId } = payload;
    
    if (!userId) {
      client.emit('error', { message: 'userId is required' });
      return;
    }

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    
    this.userSockets.get(userId)!.add(client.id);
    
    this.logger.log(`User ${userId} registered (socket: ${client.id})`);
    client.emit('registered', { 
      success: true, 
      userId,
      deviceCount: this.userSockets.get(userId)!.size
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }

  // Public method: Send notification to specific user
  sendToUser(userId: number, notification: any) {
    const socketIds = this.userSockets.get(userId);
    
    if (!socketIds || socketIds.size === 0) {
      this.logger.debug(`User ${userId} not connected - cannot send notification`);
      return false;
    }

    const payload = {
      ...notification,
      timestamp: new Date(),
      delivered: true
    };

    socketIds.forEach(socketId => {
      this.server.to(socketId).emit('notification', payload);
    });

    this.logger.log(`Sent notification to user ${userId} (${socketIds.size} device(s))`);
    return true;
  }

  // Public method: Broadcast to all connected users
  broadcast(notification: any) {
    this.server.emit('broadcast', {
      ...notification,
      timestamp: new Date(),
      type: 'broadcast'
    });

    this.logger.log(`Broadcast notification to all users`);
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Get user connection status
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}
```

**File 2:** Update `BE-baotienweb.cloud/src/notifications/notifications.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway], // Export gateway
})
export class NotificationsModule {}
```

**File 3:** Update `BE-baotienweb.cloud/src/notifications/notifications.service.ts`

```typescript
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: any) {
    // Save to database
    const notification = await this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type || 'info',
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        priority: createNotificationDto.priority || 'normal',
        read: false,
        createdAt: new Date(),
      },
    });

    // Send via WebSocket in real-time
    this.notificationsGateway.sendToUser(
      notification.userId,
      notification
    );

    return { success: true, notification };
  }

  // ... rest of your existing methods ...
}
```

---

### Bước 2: Test Backend Locally (15 phút)

```powershell
# Terminal 1: Start backend
cd BE-baotienweb.cloud
npm run start:dev

# Wait for: "Application is running on: http://localhost:3000"
# Check WebSocket: "NotificationsGateway initialized"
```

```powershell
# Terminal 2: Test WebSocket connection
# Install wscat if not available: npm install -g wscat

wscat -c "ws://localhost:3000/notifications"

# After connected, send:
{"event":"register","data":{"userId":22}}

# You should receive:
# {"event":"registered","data":{"success":true,"userId":22,"deviceCount":1}}
```

---

### Bước 3: Frontend Integration (45 phút)

**Update:** `context/NotificationContext.tsx`

```typescript
import { createContext, ReactNode, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { useAuth } from './AuthContext';
import { ENV } from '@/config/env';
import { NOTIFICATION_ENDPOINTS } from '@/constants/api-endpoints';
import { apiFetch } from '@/services/api';

// ... existing interfaces ...

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);

  // Fetch notifications from REST API
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiFetch(NOTIFICATION_ENDPOINTS.LIST);
      
      if (response.success && Array.isArray(response.notifications)) {
        setNotifications(response.notifications);
        setUnreadCount(response.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error: any) {
      if (error?.status === 404) {
        console.warn('[Notifications] Endpoint not found (404). Using empty list.');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('[Notifications] Fetch error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection
  useEffect(() => {
    if (!user) {
      // Cleanup if user logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    console.log('[Notifications] Initializing WebSocket connection...');

    // Create WebSocket connection
    const wsUrl = ENV.WS_URL.replace('/ws', '/notifications'); // wss://baotienweb.cloud/notifications
    const socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Notifications] WebSocket connected');
      setIsConnected(true);
      
      // Register user for notifications
      socket.emit('register', { userId: user.id });
    });

    socket.on('connected', (data) => {
      console.log('[Notifications] Connected to server:', data);
    });

    socket.on('registered', (data) => {
      console.log('[Notifications] Registered successfully:', data);
    });

    socket.on('notification', (notification: Notification) => {
      console.log('[Notifications] Received real-time notification:', notification);
      
      // Add to state at the beginning
      setNotifications(prev => [notification, ...prev]);
      
      // Increment unread count
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Show toast notification
      Toast.show({
        type: notification.type === 'error' ? 'error' : notification.type === 'success' ? 'success' : 'info',
        text1: notification.title,
        text2: notification.message,
        position: 'top',
        visibilityTime: 4000,
        topOffset: 50,
      });
      
      // Optional: Play sound
      // await Audio.Sound.createAsync(require('@/assets/sounds/notification.mp3')).playAsync();
    });

    socket.on('broadcast', (notification: any) => {
      console.log('[Notifications] Broadcast received:', notification);
      // Handle broadcast notifications (system-wide)
    });

    socket.on('disconnect', () => {
      console.log('[Notifications] WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('[Notifications] WebSocket error:', error);
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      console.log('[Notifications] Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // ... rest of existing methods (markAsRead, etc.) ...

  const value = {
    notifications,
    unreadCount,
    loading,
    isConnected, // NEW: expose connection status
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
```

---

### Bước 4: Test End-to-End (15 phút)

**Test Scenario 1: Connection**
1. Open app
2. Login with user ID 22
3. Check console: Should see "WebSocket connected" and "Registered successfully"

**Test Scenario 2: Create Notification via API**
```powershell
# PowerShell
curl -X POST http://localhost:3000/api/v1/notifications `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{
    "userId": 22,
    "type": "info",
    "title": "Test Real-time",
    "message": "This notification should appear instantly!",
    "priority": "high"
  }'
```

**Expected Result:**
- ✅ Toast appears in app immediately (no refresh!)
- ✅ Notification appears in list
- ✅ Badge count increases
- ✅ Console shows: "Received real-time notification"

---

## 📊 Success Metrics

After 2 hours, you should have:
- ✅ WebSocket gateway running
- ✅ Frontend connected to WebSocket
- ✅ Real-time notifications working
- ✅ Toast messages showing
- ✅ Badge count updating automatically
- ✅ No need to refresh to see new notifications

---

## 🎯 Next Steps (After this works)

Once notifications WebSocket works:
1. **Deploy to VPS** (copy gateway file, restart PM2)
2. **Add Chat WebSocket** (similar pattern)
3. **Add Progress WebSocket** (already exists, just test)
4. **Deploy WebRTC fixes** (when VPS access is stable)

---

## ⚠️ If Issues Arise

**Issue:** WebSocket không connect
**Fix:** Check ENV.WS_URL trong config/env.ts

**Issue:** "register" không work
**Fix:** Check backend logs: `npm run start:dev` output

**Issue:** Toast không hiện
**Fix:** Ensure Toast.show() import correct from react-native-toast-message

---

**Bắt đầu với File 1 ngay không?** Tôi sẽ tạo notifications.gateway.ts file! 🚀
