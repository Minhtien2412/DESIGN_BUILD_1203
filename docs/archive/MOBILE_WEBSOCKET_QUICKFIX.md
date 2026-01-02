# Mobile App - Quick Fix for WebSocket Error

## 🔴 Current Issue

```
WARN [Socket] Connection error: Invalid namespace
WARN [Socket] Max reconnection attempts reached
```

**Root Cause:** App trying to connect to `/ws` namespace which doesn't exist on backend.

---

## ✅ Quick Fix Options

### Option 1: Disable WebSocket Temporarily (Fastest)

**File: `app/_layout.tsx` or `contexts/WebSocketContext.tsx`**

Find WebSocket initialization code and add feature flag:

```typescript
// Add at top of file
const ENABLE_WEBSOCKET = false; // Disable until backend namespace is fixed

export default function RootLayout() {
  useEffect(() => {
    // OLD CODE:
    // connectWebSocket();
    
    // NEW CODE:
    if (ENABLE_WEBSOCKET) {
      connectWebSocket();
    } else {
      console.log('[WebSocket] Disabled - feature flag off');
    }
  }, []);
  
  // ... rest of code
}
```

**Result:** No more WebSocket errors, app works normally without real-time features.

---

### Option 2: Update to Use Progress Namespace (Recommended)

**Step 1: Update `.env`**

```env
# Add new WebSocket URLs
WS_CHAT_URL=wss://baotienweb.cloud/chat
WS_PROGRESS_URL=wss://baotienweb.cloud/progress

# Keep old for backward compatibility (optional)
WS_URL=wss://baotienweb.cloud/ws
```

**Step 2: Create New WebSocket Service**

**File: `services/progressWebSocket.ts` (NEW FILE)**

```typescript
import io, { Socket } from 'socket.io-client';
import ENV from '@/config/env';

let progressSocket: Socket | null = null;

export const connectProgressWebSocket = (): Socket => {
  if (progressSocket?.connected) {
    console.log('[ProgressWebSocket] Already connected');
    return progressSocket;
  }

  const wsUrl = ENV.WS_PROGRESS_URL || 'wss://baotienweb.cloud/progress';
  console.log('[ProgressWebSocket] Connecting to:', wsUrl);

  progressSocket = io(wsUrl, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  progressSocket.on('connect', () => {
    console.log('[ProgressWebSocket] ✅ Connected');
  });

  progressSocket.on('disconnect', (reason) => {
    console.log('[ProgressWebSocket] Disconnected:', reason);
  });

  progressSocket.on('connect_error', (error) => {
    console.warn('[ProgressWebSocket] Connection error:', error.message);
  });

  return progressSocket;
};

export const subscribeToTaskProgress = (
  taskId: number,
  callback: (data: any) => void
) => {
  if (!progressSocket || !progressSocket.connected) {
    console.error('[ProgressWebSocket] Not connected');
    return () => {}; // Return empty cleanup function
  }

  progressSocket.emit('subscribe:task', { taskId });
  progressSocket.on(`task:progress:${taskId}`, callback);

  console.log(`[ProgressWebSocket] Subscribed to task:${taskId}`);

  // Return cleanup function
  return () => {
    progressSocket?.emit('unsubscribe:task', { taskId });
    progressSocket?.off(`task:progress:${taskId}`, callback);
    console.log(`[ProgressWebSocket] Unsubscribed from task:${taskId}`);
  };
};

export const subscribeToProjectProgress = (
  projectId: number,
  callback: (data: any) => void
) => {
  if (!progressSocket || !progressSocket.connected) {
    console.error('[ProgressWebSocket] Not connected');
    return () => {};
  }

  progressSocket.emit('subscribe:project', { projectId });
  progressSocket.on(`project:progress:${projectId}`, callback);

  console.log(`[ProgressWebSocket] Subscribed to project:${projectId}`);

  return () => {
    progressSocket?.emit('unsubscribe:project', { projectId });
    progressSocket?.off(`project:progress:${projectId}`, callback);
    console.log(`[ProgressWebSocket] Unsubscribed from project:${projectId}`);
  };
};

export const disconnectProgressWebSocket = () => {
  if (progressSocket) {
    progressSocket.disconnect();
    progressSocket = null;
    console.log('[ProgressWebSocket] Disconnected');
  }
};

export const getProgressSocket = () => progressSocket;
```

**Step 3: Update App Layout**

**File: `app/_layout.tsx`**

```typescript
import { connectProgressWebSocket, disconnectProgressWebSocket } from '@/services/progressWebSocket';

export default function RootLayout() {
  useEffect(() => {
    // Connect to progress WebSocket when app starts
    connectProgressWebSocket();

    return () => {
      // Cleanup on unmount
      disconnectProgressWebSocket();
    };
  }, []);

  // ... rest of layout
}
```

**Step 4: Use in Components (Example)**

**File: `app/(tabs)/projects/[id].tsx`**

```typescript
import { useEffect, useState } from 'react';
import { subscribeToProjectProgress } from '@/services/progressWebSocket';

export default function ProjectDetailScreen({ route }) {
  const { id } = route.params;
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    // Subscribe to project progress updates
    const unsubscribe = subscribeToProjectProgress(
      parseInt(id),
      (data) => {
        console.log('📊 Project progress update:', data);
        setProgress(data.progress);
      }
    );

    // Cleanup on unmount
    return unsubscribe;
  }, [id]);

  return (
    <View>
      {progress && (
        <View>
          <Text>Progress: {progress.overallProgress}%</Text>
          <ProgressBar value={progress.overallProgress / 100} />
        </View>
      )}
    </View>
  );
}
```

---

### Option 3: Fix Existing WebSocket Code

**Find the existing WebSocket connection code:**

Search for: `io('wss://baotienweb.cloud/ws'` or `io(ENV.WS_URL`

**Replace with:**

```typescript
// OLD:
const socket = io('wss://baotienweb.cloud/ws');

// NEW:
const socket = io('wss://baotienweb.cloud/progress', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

---

## 🧪 Testing

### After implementing fix:

1. **Clear app cache:**
   ```bash
   npx expo start -c
   ```

2. **Check logs for:**
   ```
   ✅ [ProgressWebSocket] Connected
   ✅ [ProgressWebSocket] Subscribed to project:1
   ```

3. **Should NOT see:**
   ```
   ❌ [Socket] Connection error: Invalid namespace
   ❌ [Socket] Max reconnection attempts reached
   ```

---

## 📋 Checklist

- [ ] Choose fix option (Option 1 = fastest, Option 2 = best)
- [ ] Update code files
- [ ] Update `.env` if using Option 2
- [ ] Clear Expo cache: `npx expo start -c`
- [ ] Test app - no more WebSocket errors
- [ ] Verify real-time updates working (if using Option 2)

---

## 🚀 After Fix - Next Steps

1. **Test progress tracking:**
   - Open a project screen
   - Update project status via backend
   - Should see UI update in real-time

2. **Performance:**
   - Subscribe only to relevant tasks/projects
   - Unsubscribe when leaving screens
   - Use throttling for rapid updates

3. **Error handling:**
   - Show offline indicator when WebSocket disconnected
   - Cache last known progress
   - Auto-reconnect on network restore

---

## 📝 Files to Modify

**Option 1 (Disable):**
- `app/_layout.tsx` or `contexts/WebSocketContext.tsx`

**Option 2 (Fix properly):**
- `.env`
- `services/progressWebSocket.ts` (NEW)
- `app/_layout.tsx`
- Any component using progress tracking

**Option 3 (Quick patch):**
- Search for existing WebSocket connection code
- Replace namespace `/ws` → `/progress`

---

## ⚡ Fastest Fix (Copy-Paste)

**File: `app/_layout.tsx`**

Find this line:
```typescript
connectWebSocket(); // or similar
```

Replace with:
```typescript
// TEMPORARY FIX: Disable WebSocket until backend is ready
// connectWebSocket();
console.log('[WebSocket] Disabled temporarily');
```

Done! Rebuild app and error should be gone.

---

## 💡 Tips

- **Development:** Use Option 1 (disable) to quickly fix error
- **Production:** Use Option 2 (proper fix) for real-time features
- **Debugging:** Enable verbose WebSocket logs:
  ```typescript
  progressSocket.onAny((event, ...args) => {
    console.log(`[WS Event] ${event}:`, args);
  });
  ```

---

**Estimated Time:**
- Option 1: 2 minutes
- Option 2: 15 minutes
- Option 3: 5 minutes
