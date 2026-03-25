# Production Realtime Architecture — Final Report

**Date:** 2025-03-24  
**Scope:** 7-Phase WebSocket Architecture Overhaul  
**Status:** ✅ ALL PHASES COMPLETE

---

## Executive Summary

Consolidated the entire WebSocket architecture from fragmented, duplicated connections into a production-ready system with:

- **ONE notification socket** (was 3 concurrent connections)
- **Centralized config** for all socket URLs, options, and auth
- **JWT auth guards** on ALL 4 backend gateways (was 1 of 4)
- **Verified Nginx** WebSocket proxy with 86400s timeout
- **12/12 test cases PASS** (no-token, invalid-token, valid-token × 4 namespaces)

---

## Phase 1: Consolidate Notification Sockets

### Problem

Three independent files each created their own `io("/notifications")` connection:

1. `context/UnifiedNotificationContext.tsx`
2. `context/NotificationControllerContext.tsx`
3. `services/badgeSyncService.ts`

This caused 3× connections per user, race conditions on event handling, and inconsistent reconnection behavior.

### Solution — Singleton Service

**Created:** `services/socket/notificationSocket.ts`

```
NotificationSocketService (singleton)
  ├── connect(userId)     → opens ONE socket to /notifications
  ├── disconnect()        → tears down on logout
  ├── on(event, listener) → returns unsubscribe fn
  ├── emitToServer(event) → pass-through to server
  └── connected (getter)  → boolean status
```

**Refactored consumers:**

| File                                | Before                                                 | After                                                                 |
| ----------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| `UnifiedNotificationContext.tsx`    | Created own `io("/notifications")` via `getSocketIo()` | Calls `notificationSocket.connect(userId)`, subscribes via `.on()`    |
| `NotificationControllerContext.tsx` | Created own `io("/notifications")` via `getSocketIo()` | Subscribes via `notificationSocket.on()`, emits via `.emitToServer()` |
| `badgeSyncService.ts`               | Had `this.notificationSocket` field, own connection    | Uses `subscribeToNotificationSingleton()`, stores unsub fns           |

**Result:** 3 connections → 1 connection. All consumers share the same socket. 0 TS errors.

---

## Phase 2: Standardize Socket Architecture

### Problem

Multiple socket files used different patterns:

- Direct `import { io } from "socket.io-client"` (bypasses lazy loading)
- Hardcoded URLs (`ws://api.thietkeresort.com.vn:3002`, `wss://baotienweb.cloud`)
- Inconsistent auth token injection

### Solution

All socket files now use the centralized `services/socket/socketConfig.ts`:

| File                                        | Fix Applied                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `services/conversations-socket.service.ts`  | `import { io }` → `getSocketIo()` + `buildNamespaceUrl("conversations")` + `buildSocketOptions(token)` |
| `services/websocket/construction-socket.ts` | Hardcoded `ws://api.thietkeresort.com.vn:3002` → `getWsBaseUrl()`                                      |
| `services/websocket/message-socket.ts`      | `ENV.WS_URL` → `getWsBaseUrl()`                                                                        |
| `lib/communication/socket.ts`               | `process.env.EXPO_PUBLIC_WS_URL \|\| 'wss://baotienweb.cloud'` → `getWsBaseUrl()`                      |

**Result:** All socket URLs resolve from ONE source (`socketConfig.ts`). 0 TS errors.

---

## Phase 3: Clean Legacy Socket Code

Completed as part of Phase 2. Removed:

- All hardcoded WebSocket URLs
- Direct `socket.io-client` imports (replaced with lazy `getSocketIo()`)
- Duplicate URL builder logic

**Not removed (out of scope, still functional):**

- `src/services/socket.ts` — legacy archive module, only 2 imports
- `services/socketManager.ts` — used by many files, already uses `getSocketIo`

---

## Phase 4: JWT Auth on Backend Gateways

### Problem

Only `/call` gateway had JWT authentication. The other 3 accepted ANY connection:

| Gateway          | Before      | After                   |
| ---------------- | ----------- | ----------------------- |
| `/call`          | ✅ JWT auth | ✅ JWT auth (unchanged) |
| `/notifications` | ❌ No auth  | ✅ JWT auth             |
| `/chat`          | ❌ No auth  | ✅ JWT auth             |
| `/progress`      | ❌ No auth  | ✅ JWT auth             |

### Implementation

**Auth pattern (same for all 4 gateways):**

```typescript
async handleConnection(client: Socket) {
  try {
    const token = client.handshake.auth?.token
      || client.handshake.query?.token
      || client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.emit('error', { message: 'Authentication required' });
      client.disconnect(true);
      return;
    }

    const payload = this.jwtService.verify(token as string, {
      secret: this.configService.get('JWT_SECRET', 'supersecret'),
    });

    const userId = payload.sub;
    // Auto-register userId in the userSockets map
    this.userSockets.set(userId.toString(), client.id);
    client.emit('connected', { userId, socketId: client.id });
  } catch (error) {
    client.emit('error', { message: 'Invalid token' });
    client.disconnect(true);
  }
}
```

**Files modified (6 files):**

| File                                     | Changes                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `notifications/notifications.gateway.ts` | Added `JwtService`, `ConfigService` injection + JWT `handleConnection` |
| `notifications/notifications.module.ts`  | Added `JwtModule.registerAsync()` with `ConfigModule`                  |
| `chat/chat.gateway.ts`                   | Added `JwtService`, `ConfigService`, `Logger` + JWT `handleConnection` |
| `chat/chat.module.ts`                    | Added `JwtModule.registerAsync()` with `ConfigModule`                  |
| `progress/progress.gateway.ts`           | Added `JwtService`, `ConfigService` + JWT `handleConnection`           |
| `progress/progress.module.ts`            | Added `JwtModule.registerAsync()` with `ConfigModule`                  |

**Deployed:** All 6 files SCP'd to `103.200.20.100:/var/www/baotienweb-api/src/`, built with `npx nest build`, restarted PM2 + Docker.

---

## Phase 5: Verify Nginx Configuration

**Server:** 103.200.20.100  
**Result:** `nginx -t` → syntax OK, test successful

Both virtual hosts have correct WebSocket proxy:

```nginx
location /socket.io/ {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400s;   # 24h — prevents idle disconnects
    proxy_send_timeout 86400s;
}
```

- `baotienweb.cloud` (port 443 → 3002) ✅
- `api.baotienweb.cloud` (port 443 → 3002) ✅

---

## Phase 6: Test Matrix

### Test Environment

- **Server:** 103.200.20.100 (localhost:3000 via PM2)
- **Docker:** `baotienweb-api` container (port 3002→3000)
- **JWT Secret:** Read from `.env` via `ConfigService`

### Results: 12/12 PASS

| Namespace        | No Token                               | Invalid Token                | Valid Token                            |
| ---------------- | -------------------------------------- | ---------------------------- | -------------------------------------- |
| `/notifications` | ✅ BLOCKED ("Authentication required") | ✅ BLOCKED ("Invalid token") | ✅ CONNECTED (userId=1, deviceCount=1) |
| `/chat`          | ✅ BLOCKED                             | ✅ BLOCKED                   | ✅ CONNECTED (userId=1)                |
| `/progress`      | ✅ BLOCKED                             | ✅ BLOCKED                   | ✅ CONNECTED (userId=1)                |
| `/call`          | ✅ BLOCKED                             | ✅ BLOCKED                   | ✅ CONNECTED (userId=1)                |

**Key observations:**

- Server sends descriptive error messages before disconnecting
- Valid token triggers auto-registration (userId extracted from `payload.sub`)
- `/notifications` gateway returns rich metadata (deviceCount, timestamp, namespace)

---

## Architecture: Before vs After

### Before

```
┌─ UnifiedNotificationContext ──► io("/notifications") ──► Server
├─ NotificationControllerCtx ──► io("/notifications") ──► Server  (DUPLICATE)
├─ BadgeSyncService ────────────► io("/notifications") ──► Server  (DUPLICATE)
├─ conversations-socket ────────► io("/conversations") ──► Server  (direct import)
├─ construction-socket ─────────► ws://hardcoded:3002  ──► Server
├─ message-socket ──────────────► ENV.WS_URL/ws/messages ► Server
├─ lib/communication/socket ────► wss://baotienweb.cloud ► Server
│
│  Backend: /notifications = NO AUTH
│  Backend: /chat          = NO AUTH
│  Backend: /progress      = NO AUTH
│  Backend: /call          = JWT AUTH ✓
```

### After

```
┌─ notificationSocket.ts ─────────► io("/notifications") ──► JWT ──► Server
│  ├── UnifiedNotificationContext    (subscriber)
│  ├── NotificationControllerCtx     (subscriber)
│  └── BadgeSyncService              (subscriber)
│
├─ conversations-socket ───────────► getSocketIo() + socketConfig ──► Server
├─ construction-socket ────────────► getWsBaseUrl() ───────────────► Server
├─ message-socket ─────────────────► getWsBaseUrl() ───────────────► Server
├─ lib/communication/socket ───────► getWsBaseUrl() ───────────────► Server
│
│  Backend: /notifications = JWT AUTH ✓
│  Backend: /chat          = JWT AUTH ✓
│  Backend: /progress      = JWT AUTH ✓
│  Backend: /call          = JWT AUTH ✓
```

---

## Files Changed Summary

### Frontend (7 files)

| #   | File                                        | Action                                                                |
| --- | ------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `services/socket/notificationSocket.ts`     | **CREATED** — Singleton notification socket service                   |
| 2   | `context/UnifiedNotificationContext.tsx`    | **REFACTORED** — Uses singleton, removed own socket creation          |
| 3   | `context/NotificationControllerContext.tsx` | **REFACTORED** — Uses singleton subscription                          |
| 4   | `services/badgeSyncService.ts`              | **REFACTORED** — Uses singleton, removed `this.notificationSocket`    |
| 5   | `services/conversations-socket.service.ts`  | **FIXED** — `getSocketIo()` + `socketConfig` instead of direct import |
| 6   | `services/websocket/construction-socket.ts` | **FIXED** — `getWsBaseUrl()` instead of hardcoded URL                 |
| 7   | `services/websocket/message-socket.ts`      | **FIXED** — `getWsBaseUrl()` instead of `ENV.WS_URL`                  |
| 8   | `lib/communication/socket.ts`               | **FIXED** — `getWsBaseUrl()` instead of `process.env` fallback        |

### Backend (6 files)

| #   | File                                                             | Action                                   |
| --- | ---------------------------------------------------------------- | ---------------------------------------- |
| 1   | `BE-baotienweb.cloud/src/notifications/notifications.gateway.ts` | **ADDED** JWT auth in `handleConnection` |
| 2   | `BE-baotienweb.cloud/src/notifications/notifications.module.ts`  | **ADDED** `JwtModule.registerAsync()`    |
| 3   | `BE-baotienweb.cloud/src/chat/chat.gateway.ts`                   | **ADDED** JWT auth + Logger              |
| 4   | `BE-baotienweb.cloud/src/chat/chat.module.ts`                    | **ADDED** `JwtModule.registerAsync()`    |
| 5   | `BE-baotienweb.cloud/src/progress/progress.gateway.ts`           | **ADDED** JWT auth                       |
| 6   | `BE-baotienweb.cloud/src/progress/progress.module.ts`            | **ADDED** `JwtModule.registerAsync()`    |

---

## Deployment Steps Performed

1. SCP'd 6 backend files to `103.200.20.100:/var/www/baotienweb-api/src/`
2. `npx nest build` → EXIT:0
3. `pm2 restart baotienweb-api` → online
4. Copied compiled `dist/` to Docker container
5. `docker restart baotienweb-api` → healthy
6. Verified `nginx -t` → OK
7. Ran 12-test matrix → ALL PASS

---

## Known Issues & Next Steps

| Issue                                                                        | Priority | Notes                                                               |
| ---------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| `chat.module.ts` workspace has `AiInternalModule` import; production doesn't | Low      | Module doesn't exist on production; removed via `sed` during deploy |
| `src/services/socket.ts` (legacy) still uses direct import                   | Low      | Only 2 consumers, archive-related code                              |
| `services/socketManager.ts` has own URL builder                              | Low      | Works correctly; uses `getSocketIo` already                         |
| `supersecret` fallback in gateway configs                                    | Info     | Only used if `JWT_SECRET` env var is missing; production has it set |
| `socket.io-client` installed `--no-save` on server for testing               | Cleanup  | Will be removed on next `npm ci`                                    |

---

## Security Improvements

1. **All 4 WebSocket gateways now require valid JWT** — prevents unauthorized real-time data access
2. **Token extraction from 3 sources** (auth, query, headers) — compatible with all Socket.IO client patterns
3. **Auto-registration** — userId from JWT `sub` claim, no client-supplied userId spoofing
4. **Descriptive errors** before disconnect — helps client-side error handling without leaking internals
5. **Nginx `proxy_read_timeout 86400s`** — prevents premature WebSocket drops in production
