# Backend Implementation: Socket.IO Server

**Priority**: 🔴 HIGH  
**Estimated Time**: 4 hours  
**Complexity**: Medium-High  
**Status**: PENDING ⏳

---

## 📋 Quick Summary

Setup Socket.IO server with authentication middleware to enable real-time features: chat messages, notifications, typing indicators, project updates, and live streams.

**Mobile Status**: ✅ READY (WebSocket contexts already implemented)

---

## 📦 Dependencies

Install required packages:

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install -D @types/socket.io
```

---

## 🏗️ Architecture Overview

```
Mobile App (WebSocketContext)
       ↓
   wss://baotienweb.cloud/ws
       ↓
   Socket.IO Server (NestJS Gateway)
       ↓
   JWT Authentication Middleware
       ↓
   Event Handlers (chat, notifications, etc.)
       ↓
   Broadcast to Rooms/Users
```

---

## 🔐 Authentication Middleware

### JWT Token Verification

**File**: `src/websocket/ws-auth.middleware.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WsAuthMiddleware {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateToken(socket: Socket): Promise<any> {
    try {
      // Extract token from handshake auth or query
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        console.error('[WebSocket] No token provided');
        throw new UnauthorizedException('No token provided');
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      console.log(`[WebSocket] ✅ User authenticated: ${user.email} (${user.id})`);

      // Attach user to socket for future use
      socket.data.user = user;

      return user;
    } catch (error) {
      console.error('[WebSocket] Authentication failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

---

## 🌐 WebSocket Gateway

### Main Gateway Setup

**File**: `src/websocket/websocket.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { WsAuthMiddleware } from './ws-auth.middleware';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Configure properly in production
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
export class WebSocketGatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track online users: Map<userId, Set<socketId>>
  private onlineUsers = new Map<number, Set<string>>();

  constructor(
    private wsAuth: WsAuthMiddleware,
    private prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    console.log('[WebSocket] Server initialized ✅');
  }

  async handleConnection(socket: Socket) {
    try {
      console.log(`[WebSocket] Client connecting... ${socket.id}`);

      // Authenticate user
      const user = await this.wsAuth.validateToken(socket);

      // Track online status
      if (!this.onlineUsers.has(user.id)) {
        this.onlineUsers.set(user.id, new Set());
      }
      this.onlineUsers.get(user.id)!.add(socket.id);

      // Join user's personal room (for notifications)
      socket.join(`user:${user.id}`);

      console.log(`[WebSocket] ✅ User ${user.email} connected (${socket.id})`);
      console.log(`[WebSocket] 📊 Online users: ${this.onlineUsers.size}`);

      // Notify others about user online status
      socket.broadcast.emit('user:online', { userId: user.id });

      // Send welcome message
      socket.emit('connection:success', {
        message: 'Connected to WebSocket server',
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error.message);
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    const user = socket.data.user;

    if (user) {
      // Remove from online users
      const userSockets = this.onlineUsers.get(user.id);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          this.onlineUsers.delete(user.id);
          // User fully offline (no more sockets)
          socket.broadcast.emit('user:offline', { userId: user.id });
        }
      }

      console.log(`[WebSocket] ❌ User ${user.email} disconnected (${socket.id})`);
      console.log(`[WebSocket] 📊 Online users: ${this.onlineUsers.size}`);
    }
  }

  // ============================================================================
  // CHAT EVENTS
  // ============================================================================

  @SubscribeMessage('join:chat')
  async handleJoinChat(
    @MessageBody() data: { projectId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { projectId } = data;

    // Join chat room
    socket.join(`chat:${projectId}`);

    console.log(`[WebSocket] User ${user.id} joined chat ${projectId}`);

    // Notify others in the room
    socket.to(`chat:${projectId}`).emit('user:joined_chat', {
      userId: user.id,
      userName: user.name,
      projectId,
    });

    return { success: true, projectId };
  }

  @SubscribeMessage('leave:chat')
  async handleLeaveChat(
    @MessageBody() data: { projectId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { projectId } = data;

    socket.leave(`chat:${projectId}`);

    console.log(`[WebSocket] User ${user.id} left chat ${projectId}`);

    socket.to(`chat:${projectId}`).emit('user:left_chat', {
      userId: user.id,
      projectId,
    });

    return { success: true, projectId };
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() data: { projectId: number; content: string; type: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { projectId, content, type } = data;

    try {
      // Save message to database
      const message = await this.prisma.chatMessage.create({
        data: {
          projectId,
          userId: user.id,
          content,
          type: type || 'text',
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      console.log(`[WebSocket] Message sent by ${user.id} to project ${projectId}`);

      // Broadcast to all users in the chat room
      this.server.to(`chat:${projectId}`).emit('message:new', {
        id: message.id,
        projectId: message.projectId,
        userId: message.userId,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        user: message.user,
      });

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @MessageBody() data: { projectId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { projectId } = data;

    // Broadcast typing indicator to others (not self)
    socket.to(`chat:${projectId}`).emit('typing:started', {
      userId: user.id,
      userName: user.name,
      projectId,
    });

    return { success: true };
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @MessageBody() data: { projectId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { projectId } = data;

    socket.to(`chat:${projectId}`).emit('typing:stopped', {
      userId: user.id,
      projectId,
    });

    return { success: true };
  }

  // ============================================================================
  // NOTIFICATION EVENTS
  // ============================================================================

  @SubscribeMessage('notification:mark_read')
  async handleMarkNotificationRead(
    @MessageBody() data: { notificationId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { notificationId } = data;

    try {
      // Update notification in database
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: user.id,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      console.log(`[WebSocket] Notification ${notificationId} marked as read by ${user.id}`);

      return { success: true, notificationId };
    } catch (error) {
      console.error('[WebSocket] Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to specific user
   * Called from other services (not socket event)
   */
  async sendNotification(userId: number, notification: any) {
    console.log(`[WebSocket] Sending notification to user ${userId}`);

    // Emit to user's personal room
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  // ============================================================================
  // PROJECT EVENTS
  // ============================================================================

  @SubscribeMessage('join:project')
  async handleJoinProject(
    @MessageBody() data: { projectId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { projectId } = data;

    socket.join(`project:${projectId}`);

    console.log(`[WebSocket] User ${user.id} joined project ${projectId}`);

    return { success: true, projectId };
  }

  @SubscribeMessage('leave:project')
  async handleLeaveProject(
    @MessageBody() data: { projectId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { projectId } = data;

    socket.leave(`project:${projectId}`);

    console.log(`[WebSocket] User ${user.id} left project ${projectId}`);

    return { success: true, projectId };
  }

  /**
   * Broadcast project update to all members
   * Called from ProjectService
   */
  async broadcastProjectUpdate(projectId: number, update: any) {
    console.log(`[WebSocket] Broadcasting project ${projectId} update`);

    this.server.to(`project:${projectId}`).emit('project:updated', {
      projectId,
      update,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================================================
  // LIVE STREAM EVENTS
  // ============================================================================

  @SubscribeMessage('join:live')
  async handleJoinLive(
    @MessageBody() data: { streamId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { streamId } = data;

    socket.join(`live:${streamId}`);

    console.log(`[WebSocket] User ${user.id} joined live stream ${streamId}`);

    // Notify others
    socket.to(`live:${streamId}`).emit('viewer:joined', {
      userId: user.id,
      userName: user.name,
      streamId,
    });

    return { success: true, streamId };
  }

  @SubscribeMessage('live:comment')
  async handleLiveComment(
    @MessageBody() data: { streamId: string; text: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    const { streamId, text } = data;

    const comment = {
      id: Date.now(),
      streamId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all viewers
    this.server.to(`live:${streamId}`).emit('live:new_comment', comment);

    return { success: true, comment };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get online status of a user
   */
  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): number[] {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * Get online users count
   */
  getOnlineCount(): number {
    return this.onlineUsers.size;
  }
}
```

---

## 📁 Module Configuration

**File**: `src/websocket/websocket.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { WebSocketGatewayService } from './websocket.gateway';
import { WsAuthMiddleware } from './ws-auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({}), // Will use ConfigService for secret
    ConfigModule,
    PrismaModule,
  ],
  providers: [WebSocketGatewayService, WsAuthMiddleware],
  exports: [WebSocketGatewayService],
})
export class WebSocketModule {}
```

**Add to `app.module.ts`**:

```typescript
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // ... existing modules
    WebSocketModule,
  ],
})
export class AppModule {}
```

---

## 🗄️ Database Schema Updates

Add to `prisma/schema.prisma`:

```prisma
model ChatMessage {
  id        Int      @id @default(autoincrement())
  projectId Int
  project   Project  @relation(fields: [projectId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  content   String
  type      String   @default("text") // 'text', 'image', 'file'
  createdAt DateTime @default(now())
  
  @@index([projectId])
  @@index([userId])
}

model Notification {
  id        Int       @id @default(autoincrement())
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  type      String    // 'PROJECT_UPDATE', 'TASK_ASSIGNED', etc.
  title     String
  message   String
  data      Json?     // Additional context
  read      Boolean   @default(false)
  readAt    DateTime?
  createdAt DateTime  @default(now())
  
  @@index([userId, read])
}

// Add to existing models
model User {
  // ... existing fields
  chatMessages ChatMessage[]
  notifications Notification[]
}

model Project {
  // ... existing fields
  chatMessages ChatMessage[]
}
```

**Run Migration**:
```bash
npx prisma migrate dev --name add-websocket-tables
```

---

## 🧪 Testing

### 1. Test with wscat (Command Line)

Install wscat:
```bash
npm install -g wscat
```

**Connect with authentication**:
```bash
# Get JWT token first (from login endpoint)
TOKEN="eyJhbGc..."

# Connect
wscat -c "ws://localhost:3000/ws" \
  -H "Authorization: Bearer $TOKEN"

# Or with query parameter
wscat -c "ws://localhost:3000/ws?token=$TOKEN"

# After connected:
> {"event":"join:chat","data":{"projectId":1}}
< {"event":"user:joined_chat","data":{"userId":1,"userName":"Test","projectId":1}}

> {"event":"message:send","data":{"projectId":1,"content":"Hello!","type":"text"}}
< {"event":"message:new","data":{"id":1,"content":"Hello!",...}}
```

---

### 2. Test with Mobile App

Mobile app already has WebSocket integration. After backend is ready:

**Step 1: Update ENV** (if needed)
```typescript
// config/env.ts already has:
WS_URL: 'wss://baotienweb.cloud/ws'
```

**Step 2: Test Connection**
```typescript
// In mobile app console:
const { connected } = useWebSocket();
console.log('WebSocket connected:', connected); // Should be true
```

**Step 3: Test Chat**
```typescript
import { socketManager } from '@/services/socket';

// Join chat
socketManager.joinChat(1);

// Send message
socketManager.sendMessage(1, 'Hello from mobile!', 'text');

// Listen for messages
socketManager.onNewMessage((message) => {
  console.log('New message:', message);
});
```

---

### 3. Test Notifications

**From Backend** (e.g., in ProjectService):

```typescript
import { WebSocketGatewayService } from '../websocket/websocket.gateway';

@Injectable()
export class ProjectService {
  constructor(private wsGateway: WebSocketGatewayService) {}

  async updateProject(id: number, data: any) {
    // ... update logic

    // Send notification to project members
    const members = await this.getProjectMembers(id);
    for (const member of members) {
      await this.wsGateway.sendNotification(member.userId, {
        id: Date.now(),
        type: 'PROJECT_UPDATE',
        title: 'Project Updated',
        message: `Project ${project.name} has been updated`,
        data: { projectId: id },
        read: false,
        createdAt: new Date(),
      });
    }

    // Broadcast to all subscribed to project
    await this.wsGateway.broadcastProjectUpdate(id, data);
  }
}
```

**From Mobile**:
```typescript
// Listen for notifications
socketManager.onNotification((notification) => {
  console.log('New notification:', notification);
  // Show push notification or update UI
});
```

---

## 📊 Monitoring

### Add Metrics Endpoint

**File**: `src/websocket/websocket.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { WebSocketGatewayService } from './websocket.gateway';

@Controller('websocket')
export class WebSocketController {
  constructor(private wsGateway: WebSocketGatewayService) {}

  @Get('stats')
  getStats() {
    return {
      onlineUsers: this.wsGateway.getOnlineCount(),
      onlineUserIds: this.wsGateway.getOnlineUsers(),
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## 🚀 Deployment

### 1. Environment Variables

```env
# No additional env vars needed for Socket.IO
# Uses existing JWT_SECRET for authentication
```

### 2. CORS Configuration

For production, update CORS in gateway:

```typescript
@WebSocketGateway({
  cors: {
    origin: [
      'https://yourdomain.com',
      'https://app.yourdomain.com',
      'capacitor://localhost', // iOS
      'http://localhost', // Android
    ],
    credentials: true,
  },
})
```

### 3. Load Balancing with Redis (Optional)

For multiple server instances:

```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

afterInit(server: Server) {
  const pubClient = createClient({ url: 'redis://localhost:6379' });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    server.adapter(createAdapter(pubClient, subClient));
    console.log('[WebSocket] Redis adapter configured');
  });
}
```

---

## ✅ Completion Checklist

- [ ] Install Socket.IO packages
- [ ] Create `websocket.module.ts`
- [ ] Create `websocket.gateway.ts`
- [ ] Create `ws-auth.middleware.ts`
- [ ] Add database migrations (ChatMessage, Notification)
- [ ] Test with wscat (manual)
- [ ] Test with mobile app
- [ ] Test all events (chat, notifications, typing)
- [ ] Update CORS for production
- [ ] Add monitoring/stats endpoint
- [ ] Deploy to staging
- [ ] Mobile team integration test
- [ ] Production deployment

---

**Estimated Time**: 4 hours  
**Priority**: 🔴 HIGH  
**Mobile Dependency**: ChatContext, NotificationContext already implemented and waiting
