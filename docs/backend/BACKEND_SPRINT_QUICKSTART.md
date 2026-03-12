# 🎯 Backend Sprint - Quick Start Guide

**Created**: November 24, 2025  
**Total Time**: 6-8 hours  
**Priority**: 🔴 HIGH (Mobile app đang chờ)  
**Status**: READY TO IMPLEMENT

---

## 📊 Tổng Quan

Mobile app đã hoàn thành 92% và đang chờ 3 backend endpoints chính:

1. **Token Refresh** - Auto-refresh expired tokens
2. **Socket.IO Server** - Real-time chat & notifications  
3. **Video API** (optional) - Video list với pagination

---

## 🚀 Implementation Order (Ưu tiên)

### ⏱️ Step 1: Token Refresh Endpoint (2 giờ)

**File**: `docs/backend/IMPLEMENT_TOKEN_REFRESH.md`

**Checklist**:
```bash
# 1. Database Migration
npx prisma migrate dev --name add-refresh-token-table

# 2. Add to auth.service.ts:
- generateRefreshToken()
- storeRefreshToken()
- refreshTokens()
- revokeAllUserTokens()

# 3. Add to auth.controller.ts:
POST /api/v1/auth/refresh

# 4. Update login/register to return refreshToken

# 5. Test
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGc..."}'
```

**Code Snippet (Quick Reference)**:
```typescript
// auth.service.ts
async refreshTokens(refreshToken: string) {
  // 1. Verify JWT
  const payload = this.jwtService.verify(refreshToken, {
    secret: this.config.get('JWT_REFRESH_SECRET'),
  });

  // 2. Check database
  const storedToken = await this.prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  // 3. Validate
  if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  // 4. Generate new tokens
  const newAccessToken = this.generateAccessToken(user.id, user.email, user.role);
  const newRefreshToken = this.generateRefreshToken(user.id);

  // 5. Token rotation
  await this.prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date(), replacedBy: newRefreshToken },
  });

  await this.storeRefreshToken(user.id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
}
```

---

### ⏱️ Step 2: Socket.IO Server (4 giờ)

**File**: `docs/backend/IMPLEMENT_SOCKETIO.md`

**Checklist**:
```bash
# 1. Install packages
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# 2. Create files:
- src/websocket/websocket.module.ts
- src/websocket/websocket.gateway.ts
- src/websocket/ws-auth.middleware.ts

# 3. Database migrations
npx prisma migrate dev --name add-websocket-tables

# 4. Test connection
npm install -g wscat
wscat -c "ws://localhost:3000/ws?token=YOUR_JWT_TOKEN"

# 5. Test events
> {"event":"join:chat","data":{"projectId":1}}
> {"event":"message:send","data":{"projectId":1,"content":"Hello!"}}
```

**Code Snippet (Gateway)**:
```typescript
// websocket.gateway.ts
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws',
})
export class WebSocketGatewayService {
  @WebSocketServer() server: Server;

  async handleConnection(socket: Socket) {
    const user = await this.wsAuth.validateToken(socket);
    socket.data.user = user;
    socket.join(`user:${user.id}`);
    console.log(`[WebSocket] User ${user.id} connected`);
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(@MessageBody() data, @ConnectedSocket() socket) {
    const message = await this.prisma.chatMessage.create({
      data: { projectId: data.projectId, userId: socket.data.user.id, content: data.content },
    });
    this.server.to(`chat:${data.projectId}`).emit('message:new', message);
  }
}
```

---

### ⏱️ Step 3: Video API (2 giờ, optional)

**File**: `VIDEO_API_BACKEND_GUIDE.md`

**Quick Implementation**:
```typescript
// videos.controller.ts
@Get()
async getVideos(
  @Query('page') page = 1,
  @Query('limit') limit = 20,
  @Query('category') category?: string,
) {
  const skip = (page - 1) * limit;
  
  const [videos, total] = await Promise.all([
    this.prisma.video.findMany({
      where: category ? { category } : undefined,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.video.count({
      where: category ? { category } : undefined,
    }),
  ]);

  return {
    data: videos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## 🗄️ Database Schemas (All Required Migrations)

### Token Refresh
```prisma
model RefreshToken {
  id           Int       @id @default(autoincrement())
  token        String    @unique
  userId       Int
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  revokedAt    DateTime?
  replacedBy   String?
  deviceInfo   String?
  ipAddress    String?
  
  @@index([userId])
  @@index([token])
}
```

### WebSocket
```prisma
model ChatMessage {
  id        Int      @id @default(autoincrement())
  projectId Int
  project   Project  @relation(fields: [projectId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  content   String
  type      String   @default("text")
  createdAt DateTime @default(now())
  
  @@index([projectId])
}

model Notification {
  id        Int       @id @default(autoincrement())
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  type      String
  title     String
  message   String
  data      Json?
  read      Boolean   @default(false)
  readAt    DateTime?
  createdAt DateTime  @default(now())
  
  @@index([userId, read])
}
```

---

## 🔐 Environment Variables

```env
# JWT Secrets (MUST be different!)
JWT_SECRET=<GENERATE_64_CHAR_RANDOM_STRING>
JWT_REFRESH_SECRET=<GENERATE_DIFFERENT_64_CHAR_STRING>

# Token Expiry
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**Generate secrets**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🧪 Testing Workflow

### 1. Token Refresh Test

```bash
# Login to get tokens
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Response: {"accessToken":"...","refreshToken":"..."}

# Refresh
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"OLD_REFRESH_TOKEN"}'

# Response: {"accessToken":"NEW...","refreshToken":"NEW..."}

# Try OLD token again (should fail with 401)
```

---

### 2. WebSocket Test

```bash
# Install wscat
npm install -g wscat

# Get JWT token from login
TOKEN="eyJhbGc..."

# Connect
wscat -c "ws://localhost:3000/ws?token=$TOKEN"

# Connected! Try events:
> {"event":"join:chat","data":{"projectId":1}}
< {"event":"user:joined_chat","data":{...}}

> {"event":"message:send","data":{"projectId":1,"content":"Hello World!","type":"text"}}
< {"event":"message:new","data":{...}}

> {"event":"typing:start","data":{"projectId":1}}
< {"event":"typing:started","data":{...}}
```

---

### 3. Mobile App Integration Test

**After backend ready**, mobile team will test:

```typescript
// Token Refresh (automatic)
const { get } = useApi();
const user = await get('/users/me'); // Auto-refreshes if token expired ✅

// WebSocket
const { connected } = useWebSocket();
console.log('Connected:', connected); // true ✅

// Chat
const { sendMessage } = useChat();
await sendMessage('1', 'Hello from mobile!', 'text'); // ✅

// Notifications
const { notifications } = useNotifications();
console.log('Real-time notifications:', notifications); // ✅
```

---

## 📈 Progress Tracking

**Mobile Status**:
- ✅ 8/24 core todos completed
- ✅ 92% mobile implementation done
- ⏳ Waiting for 3 backend endpoints

**Backend Status**:
- ✅ Google OAuth: LIVE
- ✅ Implementation guides: COMPLETE
- ⏳ Token Refresh: NOT STARTED
- ⏳ Socket.IO: NOT STARTED
- ⏳ Video API: NOT STARTED

---

## 🎯 Success Criteria

### Token Refresh
- [ ] POST /auth/refresh endpoint working
- [ ] Token rotation implemented
- [ ] Mobile app can auto-refresh (no forced logout)
- [ ] Security measures in place (reuse detection)

### Socket.IO
- [ ] WebSocket server running on /ws
- [ ] JWT authentication working
- [ ] Chat messages broadcasting
- [ ] Notifications delivering in real-time
- [ ] Mobile app receiving events

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid refresh token" even when valid

**Solution**: Check `JWT_REFRESH_SECRET` is set and correct in `.env`

---

### Issue: WebSocket authentication failing

**Solution**: 
```typescript
// Ensure middleware extracts token from multiple sources:
const token = 
  socket.handshake.auth?.token ||
  socket.handshake.query?.token ||
  socket.handshake.headers?.authorization?.replace('Bearer ', '');
```

---

### Issue: CORS errors in mobile app

**Solution**:
```typescript
@WebSocketGateway({
  cors: {
    origin: ['https://baotienweb.cloud', 'capacitor://localhost', 'http://localhost'],
    credentials: true,
  },
})
```

---

## 📞 Coordination

**Mobile Team Contact**:
- Implementation guides: ✅ COMPLETE
- Ready for testing: ✅ YES
- Testing tools: Postman, wscat, mobile app

**Backend Team Action Items**:
1. Review `docs/backend/IMPLEMENT_TOKEN_REFRESH.md`
2. Review `docs/backend/IMPLEMENT_SOCKETIO.md`
3. Schedule 1 day sprint (6-8 hours)
4. Implement Step 1 (2h) → Test → Implement Step 2 (4h) → Test
5. Notify mobile team when staging ready
6. Joint integration testing
7. Production deployment

---

## 📚 All Documentation Links

1. **TOKEN_REFRESH_COMPLETE.md** - Full token refresh documentation (mobile + backend)
2. **docs/backend/IMPLEMENT_TOKEN_REFRESH.md** - Backend implementation guide
3. **WEBSOCKET_SETUP_COMPLETE.md** - Full WebSocket documentation
4. **docs/backend/IMPLEMENT_SOCKETIO.md** - Backend Socket.IO guide
5. **VIDEO_API_BACKEND_GUIDE.md** - Video API guide
6. **BACKEND_DEVELOPMENT_ROADMAP.md** - Long-term roadmap (3 months)

---

## ✅ Quick Command Reference

```bash
# Setup
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npx prisma migrate dev

# Testing
npm install -g wscat
wscat -c "ws://localhost:3000/ws?token=TOKEN"

# Generate secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Mobile testing (after backend ready)
npm start  # In mobile app directory
# Scan QR code with Expo Go
# Test features in app
```

---

**Ready to implement! 🚀**

All code provided in implementation guides.  
Mobile team standing by for integration testing.  
Total time: 6-8 hours for backend sprint.
