# Fix WebSocket Connection Error - Mobile App

## ❌ Current Error

```
WARN [Socket] Connection error: Invalid namespace
```

**Nguyên nhân:**
- Mobile app đang kết nối đến: `wss://baotienweb.cloud/ws` (namespace không tồn tại)
- Backend chỉ có các namespaces: `/chat`, `/progress`

---

## ✅ Solutions

### Option 1: Sử dụng Progress WebSocket (Recommended)

Nếu bạn muốn track progress của tasks/projects real-time:

**Cập nhật ENV:**
```env
# .env (mobile app)
WS_PROGRESS_URL=wss://baotienweb.cloud/progress
```

**Cập nhật WebSocket Connection:**

```typescript
// services/websocket.ts hoặc context/WebSocketContext.tsx

// OLD (SAI):
const socket = io('wss://baotienweb.cloud/ws');

// NEW (ĐÚNG):
const progressSocket = io('wss://baotienweb.cloud/progress', {
  transports: ['websocket'],
  reconnection: true,
});

// Subscribe to task progress
progressSocket.on('connect', () => {
  console.log('Connected to progress socket');
  progressSocket.emit('subscribe:task', { taskId: 1 });
});

// Listen for updates
progressSocket.on('task:progress:1', (data) => {
  console.log('Task progress update:', data.progress);
  updateUI(data.progress);
});
```

---

### Option 2: Tắt WebSocket Tạm Thời

Nếu chưa cần real-time updates, tắt WebSocket connection:

**app/_layout.tsx:**
```typescript
// Tìm và comment out WebSocket initialization
// useEffect(() => {
//   connectWebSocket(); // DISABLED
// }, []);
```

Hoặc thêm feature flag:

```typescript
const ENABLE_WEBSOCKET = false; // Disable WebSocket

if (ENABLE_WEBSOCKET) {
  connectWebSocket();
}
```

---

### Option 3: Tạo Generic WebSocket Gateway (Backend)

Nếu muốn namespace `/ws` tổng quát:

**Backend - Create `src/websocket/websocket.gateway.ts`:**
```typescript
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws', // Generic namespace
})
export class WebSocketGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
```

**Backend - Create `src/websocket/websocket.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';

@Module({
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
```

**Backend - Add to `app.module.ts`:**
```typescript
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // ...existing modules
    WebSocketModule,
  ],
})
export class AppModule {}
```

---

## 🔧 Quick Fix (Recommended - Option 1)

### Step 1: Update Mobile App ENV

**File: `.env`**
```env
# OLD
WS_URL=wss://baotienweb.cloud/ws

# NEW - Add separate URLs for different namespaces
WS_CHAT_URL=wss://baotienweb.cloud/chat
WS_PROGRESS_URL=wss://baotienweb.cloud/progress
```

### Step 2: Update WebSocket Service

**File: `services/websocket.ts` or `context/WebSocketContext.tsx`**

```typescript
import io, { Socket } from 'socket.io-client';
import ENV from '@/config/env';

// Separate sockets for different purposes
let chatSocket: Socket | null = null;
let progressSocket: Socket | null = null;

// Chat WebSocket (for messaging)
export const connectChatWebSocket = () => {
  if (chatSocket?.connected) return;

  chatSocket = io(ENV.WS_CHAT_URL || 'wss://baotienweb.cloud/chat', {
    transports: ['websocket'],
    reconnection: true,
  });

  chatSocket.on('connect', () => {
    console.log('[ChatSocket] Connected');
  });

  chatSocket.on('disconnect', () => {
    console.log('[ChatSocket] Disconnected');
  });
};

// Progress WebSocket (for task/project updates)
export const connectProgressWebSocket = () => {
  if (progressSocket?.connected) return;

  progressSocket = io(ENV.WS_PROGRESS_URL || 'wss://baotienweb.cloud/progress', {
    transports: ['websocket'],
    reconnection: true,
  });

  progressSocket.on('connect', () => {
    console.log('[ProgressSocket] Connected');
  });

  progressSocket.on('disconnect', () => {
    console.log('[ProgressSocket] Disconnected');
  });

  return progressSocket;
};

// Subscribe to task progress
export const subscribeToTaskProgress = (taskId: number, callback: (data: any) => void) => {
  if (!progressSocket) {
    throw new Error('Progress socket not connected');
  }

  progressSocket.emit('subscribe:task', { taskId });
  progressSocket.on(`task:progress:${taskId}`, callback);
};

// Subscribe to project progress
export const subscribeToProjectProgress = (projectId: number, callback: (data: any) => void) => {
  if (!progressSocket) {
    throw new Error('Progress socket not connected');
  }

  progressSocket.emit('subscribe:project', { projectId });
  progressSocket.on(`project:progress:${projectId}`, callback);
};

// Cleanup
export const disconnectAllWebSockets = () => {
  chatSocket?.disconnect();
  progressSocket?.disconnect();
};
```

### Step 3: Update App Layout

**File: `app/_layout.tsx`**

```typescript
import { connectProgressWebSocket, disconnectAllWebSockets } from '@/services/websocket';

export default function RootLayout() {
  useEffect(() => {
    // Connect to progress WebSocket only
    connectProgressWebSocket();

    return () => {
      disconnectAllWebSockets();
    };
  }, []);

  // ... rest of layout
}
```

### Step 4: Use in Components

**Example: Task Progress Component**

```typescript
import { useEffect, useState } from 'react';
import { subscribeToTaskProgress } from '@/services/websocket';

export function TaskProgressView({ taskId }: { taskId: number }) {
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTaskProgress(taskId, (data) => {
      console.log('Task progress update:', data);
      setProgress(data.progress);
    });

    return () => {
      // Cleanup if needed
    };
  }, [taskId]);

  if (!progress) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>{progress.name}</Text>
      <Text>{progress.progress}% complete</Text>
    </View>
  );
}
```

---

## 📊 Testing

### Test 1: Verify Backend

```bash
# SSH to VPS
ssh root@103.200.20.100

# Rebuild
cd /root/baotienweb-api
npm run build
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 50

# Look for:
# "ProgressGateway initialized"
# "Client connected to /progress"
```

### Test 2: Test with Browser

Mở browser console tại https://baotienweb.cloud:

```javascript
// Test progress WebSocket
const progressSocket = io('wss://baotienweb.cloud/progress');

progressSocket.on('connect', () => {
  console.log('✅ Connected to /progress');
  
  // Subscribe to project 1
  progressSocket.emit('subscribe:project', { projectId: 1 });
});

progressSocket.on('project:progress:1', (data) => {
  console.log('📊 Progress update:', data);
});

// Should see: "Connected to /progress"
// Then update project via API to see event
```

### Test 3: Test from Mobile App

1. Rebuild mobile app với WebSocket update
2. Launch app
3. Check logs - should see:
   ```
   [ProgressSocket] Connected
   [ProgressSocket] Subscribed to task:1
   ```
4. Update task via backend → should see update in app

---

## 🚨 Common Issues

### Issue 1: "CORS error"
**Solution:** Backend đã cấu hình `cors: { origin: '*' }`, không cần sửa

### Issue 2: "Transport error"
**Cause:** Firewall hoặc load balancer block WebSocket

**Debug:**
```bash
# Test WebSocket port
telnet baotienweb.cloud 443

# Check nginx config (if using nginx)
cat /etc/nginx/sites-enabled/default | grep ws
```

**Nginx fix (if needed):**
```nginx
location /progress {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

### Issue 3: "Multiple connections"
**Cause:** Component re-rendering nhiều lần

**Solution:** Use singleton pattern
```typescript
let progressSocketInstance: Socket | null = null;

export const getProgressSocket = () => {
  if (!progressSocketInstance) {
    progressSocketInstance = io('wss://baotienweb.cloud/progress');
  }
  return progressSocketInstance;
};
```

---

## ✅ Checklist

Mobile App:
- [ ] Update `.env` với `WS_PROGRESS_URL`
- [ ] Update `websocket.ts` với correct namespace
- [ ] Remove old `/ws` connection code
- [ ] Add progress subscription logic
- [ ] Test connection in development

Backend:
- [ ] ProgressModule added to AppModule ✅ (DONE)
- [ ] Rebuild TypeScript: `npm run build`
- [ ] Restart PM2: `pm2 restart baotienweb-api`
- [ ] Check logs for "ProgressGateway initialized"
- [ ] Test with browser console

---

## 📝 Summary

**Root Cause:**
- Mobile app: `wss://baotienweb.cloud/ws` ❌ (namespace doesn't exist)
- Backend has: `/chat` ✅, `/progress` ✅

**Fix:**
1. Update mobile app to use `/progress` namespace
2. Or create generic `/ws` gateway on backend
3. Or disable WebSocket temporarily

**Recommended:** Use `/progress` namespace for task/project tracking (Option 1)

---

**Next Steps:**
1. Choose solution (Option 1 recommended)
2. Update mobile app code
3. Rebuild backend on VPS
4. Test connection
5. Verify real-time updates working
