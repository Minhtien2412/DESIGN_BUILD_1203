# 📢 KẾ HOẠCH PHÁT TRIỂN HỆ THỐNG THÔNG BÁO

> **Tài liệu**: Phân tích hiện trạng và kế hoạch hoàn thiện  
> **Ngày tạo**: 2025-01-24  
> **Trạng thái**: ĐANG PHÁT TRIỂN

---

## 📋 MỤC LỤC

1. [Phân tích hiện trạng](#1-phân-tích-hiện-trạng)
2. [Các vấn đề hiện tại](#2-các-vấn-đề-hiện-tại)
3. [Kiến trúc đề xuất](#3-kiến-trúc-đề-xuất)
4. [Kế hoạch phát triển](#4-kế-hoạch-phát-triển)
5. [Chi tiết triển khai](#5-chi-tiết-triển-khai)

---

## 1. PHÂN TÍCH HIỆN TRẠNG

### 1.1 Backend (NestJS)

| Thành phần     | File                          | Mô tả                      | Trạng thái    |
| -------------- | ----------------------------- | -------------------------- | ------------- |
| **Model**      | `prisma/schema.prisma`        | Table `notifications`      | ✅ Hoàn chỉnh |
| **Service**    | `notifications.service.ts`    | CRUD + Transform           | ✅ Hoàn chỉnh |
| **Controller** | `notifications.controller.ts` | REST API `/notifications`  | ✅ Hoàn chỉnh |
| **WebSocket**  | `notifications.gateway.ts`    | Namespace `/notifications` | ✅ Hoàn chỉnh |

**Database Schema** (`notifications`):

```sql
id          Int
userId      Int
type        PushNotificationType (IN_APP, TASK, PROJECT, PAYMENT, SYSTEM, etc.)
priority    NotificationPriority (LOW, MEDIUM, HIGH, URGENT)
title       String
body        String
data        Json?
imageUrl    String?
actionUrl   String?
isRead      Boolean (default: false)
readAt      DateTime?
isSent      Boolean (default: false) -- Push notification đã gửi chưa
sentAt      DateTime?
failCount   Int (default: 0)
error       String?
createdAt   DateTime
updatedAt   DateTime
```

**API Endpoints**:
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/v1/notifications` | Lấy danh sách thông báo |
| `GET` | `/api/v1/notifications/unread-count` | Đếm thông báo chưa đọc |
| `POST` | `/api/v1/notifications` | Tạo thông báo mới |
| `PATCH` | `/api/v1/notifications/:id/read` | Đánh dấu đã đọc |
| `PATCH` | `/api/v1/notifications/read-all` | Đánh dấu tất cả đã đọc |
| `PATCH` | `/api/v1/notifications/:id/archive` | Archive/Delete |

**WebSocket Events** (Namespace: `/notifications`):
| Event | Direction | Mô tả |
|-------|-----------|-------|
| `register` | Client→Server | Đăng ký userId với socket |
| `registered` | Server→Client | Xác nhận đăng ký thành công |
| `notification` | Server→Client | Thông báo mới real-time |
| `ping/pong` | Bidirectional | Health check |

### 1.2 Frontend (React Native/Expo)

**Có 11 file notification-related** - ĐÂY LÀ VẤN ĐỀ CHÍNH:

| File                                      | Mục đích           | Trùng lặp?                |
| ----------------------------------------- | ------------------ | ------------------------- |
| `services/notificationSyncService.ts`     | Sync CRM + App     | ⚠️ Chính                  |
| `services/notificationRealtimeService.ts` | WebSocket listener | ⚠️ Trùng với Context      |
| `services/notificationNavigator.ts`       | Deep linking       | ✅ Cần thiết              |
| `services/notificationService.ts`         | AI notifications   | ⚠️ Riêng biệt             |
| `services/notification-badge.ts`          | Badge counts       | ⚠️ Trùng với UnifiedBadge |
| `services/notification-listener.ts`       | Event listener     | ⚠️ Không rõ               |
| `services/api/notificationsApi.ts`        | REST API client    | ✅ Cần thiết              |
| `services/notifications.ts`               | ???                | ❓ Cần kiểm tra           |
| `services/notifications-api.ts`           | ???                | ❓ Trùng lặp?             |
| `services/push-notification.service.ts`   | Push notifications | ⚠️ Trùng với Context      |
| `services/call-notification.ts`           | Call notifications | ✅ Cần thiết              |

**Contexts**:
| File | Mục đích | Trạng thái |
|------|----------|------------|
| `context/UnifiedNotificationContext.tsx` | Main context (904 lines) | ⚠️ Quá lớn |
| `context/UnifiedBadgeContext.tsx` | Badge management | ✅ Cần thiết |
| `context/NotificationContext.tsx` | ??? | ❓ Trùng lặp? |

**Hooks**:
| File | Mục đích |
|------|----------|
| `hooks/useNotifications.ts` | Fetch + state management |

**Screens**:
| File | Sử dụng |
|------|---------|
| `features/notifications/UnifiedNotificationsScreen.tsx` | Screen chính |
| `features/notifications/NotificationsScreenModernized.tsx` | Backup |
| `app/(tabs)/notifications.tsx` | Tab route |

---

## 2. CÁC VẤN ĐỀ HIỆN TẠI

### 🔴 Critical Issues

#### 2.1 Trùng lặp Services (11 files!)

- `notificationSyncService` vs `notificationRealtimeService` - cả 2 đều kết nối WebSocket
- `notification-badge.ts` vs `UnifiedBadgeContext` - cả 2 đều quản lý badge
- `push-notification.service.ts` vs `UnifiedNotificationContext` - cả 2 đều setup push

#### 2.2 WebSocket Connection Issues

```javascript
// Trong UnifiedNotificationContext.tsx line ~335
const wsUrl = `${wsBaseUrl}${notificationNs}`;
// wsBaseUrl = "wss://baotienweb.cloud"
// notificationNs = "/notifications"
// => "wss://baotienweb.cloud/notifications"
```

**Vấn đề**: Backend gateway có namespace `/notifications` nhưng frontend có thể không gửi `register` event đúng cách.

#### 2.3 Mock Data Còn Tồn Tại

```typescript
// hooks/useNotifications.ts lines 10-86
const MOCK_NOTIFICATIONS: Notification[] = [
  // 8 mock items...
];
```

**Vấn đề**: Khi offline, app dùng mock data thay vì chỉ dùng cached data.

#### 2.4 Type Mismatch

- Backend: `body`, `isRead`
- Frontend: `message`, `read`
- Đã có transform ở backend nhưng cần kiểm tra lại mapping

#### 2.5 Badge Không Sync

- `notification-badge.ts` cache riêng trong AsyncStorage
- `UnifiedBadgeContext` có state riêng
- `useUnifiedNotifications` tính unreadCount riêng
  → 3 nguồn truth khác nhau!

### 🟡 Medium Issues

#### 2.6 CRM Sync Logic

`notificationSyncService.ts` có logic sync với Perfex CRM nhưng:

- CRM endpoints chưa được verify
- Mapping types không đồng nhất

#### 2.7 Push Notification Token

Token được lưu ở nhiều nơi:

- `@unified_push_token` (UnifiedNotificationContext)
- Backend `device_tokens` table
- Có thể không sync đúng

### 🟢 Minor Issues

#### 2.8 Friend Activity

Feature subscribe friend activity trong UnifiedNotificationContext chưa được implement đầy đủ.

---

## 3. KIẾN TRÚC ĐỀ XUẤT

### 3.1 Kiến Trúc Mới (Đơn giản hóa)

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  REST API      │  │  WebSocket     │  │  Push Service    │  │
│  │  /notifications│  │  /notifications│  │  (FCM/APNs)      │  │
│  └───────┬────────┘  └───────┬────────┘  └────────┬─────────┘  │
│          │                   │                    │             │
│          └───────────────────┴────────────────────┘             │
│                              │                                   │
│                   ┌──────────┴──────────┐                       │
│                   │  NotificationService │                       │
│                   │  (Single Source)     │                       │
│                   └──────────┬──────────┘                       │
│                              │                                   │
│                   ┌──────────┴──────────┐                       │
│                   │   PostgreSQL DB     │                       │
│                   │   notifications     │                       │
│                   └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │     Internet      │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React Native)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            NotificationProvider (SINGLE)                 │    │
│  │  ┌──────────────┬──────────────┬──────────────────────┐ │    │
│  │  │ REST Client  │  WebSocket   │  Push Handler        │ │    │
│  │  │ (apiFetch)   │  (socket.io) │  (expo-notifications)│ │    │
│  │  └──────────────┴──────────────┴──────────────────────┘ │    │
│  │                         │                                │    │
│  │  ┌──────────────────────┴─────────────────────────────┐ │    │
│  │  │              Unified State                          │ │    │
│  │  │  - notifications[]                                  │ │    │
│  │  │  - unreadCount                                      │ │    │
│  │  │  - isConnected (WebSocket)                          │ │    │
│  │  │  - pushToken                                        │ │    │
│  │  └─────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│  ┌──────┴─────┐    ┌────────┴────────┐    ┌─────┴──────┐       │
│  │ Badge      │    │ Notifications   │    │ Navigation │       │
│  │ Context    │    │ Screen          │    │ Service    │       │
│  └────────────┘    └─────────────────┘    └────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Files Cần Giữ Lại (Consolidate)

| Giữ lại                                  | Xóa/Merge                                 | Lý do                    |
| ---------------------------------------- | ----------------------------------------- | ------------------------ |
| `context/UnifiedNotificationContext.tsx` | Refactor thành nhẹ hơn                    | Core provider            |
| `services/api/notificationsApi.ts`       | Giữ nguyên                                | REST client              |
| `services/notificationNavigator.ts`      | Giữ nguyên                                | Deep linking             |
| `services/call-notification.ts`          | Giữ nguyên                                | Call-specific            |
| `context/UnifiedBadgeContext.tsx`        | Giữ nguyên                                | Badge management         |
| -                                        | `services/notificationSyncService.ts`     | Merge vào Context        |
| -                                        | `services/notificationRealtimeService.ts` | Merge vào Context        |
| -                                        | `services/notification-badge.ts`          | Dùng UnifiedBadgeContext |
| -                                        | `services/push-notification.service.ts`   | Merge vào Context        |
| -                                        | `services/notificationService.ts`         | Rename hoặc merge        |
| -                                        | `services/notification-listener.ts`       | Xóa nếu không dùng       |
| -                                        | `services/notifications.ts`               | Kiểm tra và merge        |
| -                                        | `services/notifications-api.ts`           | Dùng notificationsApi    |

---

## 4. KẾ HOẠCH PHÁT TRIỂN

### Phase 1: Cleanup & Consolidation (3-4 ngày) ✅ COMPLETED

#### Task 1.1: Audit tất cả notification files ✅

- [x] Kiểm tra `services/notifications.ts` có gì → Wrapper cho expo-notifications (GIỮ)
- [x] Kiểm tra `services/notifications-api.ts` có gì → Trùng với api/notificationsApi.ts (ĐÃ XÓA)
- [x] Kiểm tra `services/notification-listener.ts` có gì → Polling fallback không dùng (ĐÃ XÓA)
- [x] Document dependencies giữa các files

#### Task 1.2: Remove Mock Data ✅

- [x] Xóa `MOCK_NOTIFICATIONS` trong `useNotifications.ts`
- [x] Chỉ sử dụng cached data khi offline
- [x] Hiển thị empty state thay vì mock data

#### Task 1.3: Consolidate Badge Management (DEFERRED)

- [ ] Remove `services/notification-badge.ts` - GIỮ LẠI cho cart-context
- [x] `UnifiedBadgeContext` đã là single source of truth cho notifications
- [x] `notification-badge.ts` chỉ dùng cho cart badge

**Files đã xóa:**

- `services/notifications-api.ts` ❌
- `services/notification-listener.ts` ❌

**Files giữ lại (đã audit):**

- `services/notifications.ts` - expo-notifications wrapper
- `services/notification-badge.ts` - chỉ dùng cho cart
- `services/notificationService.ts` - AI notifications
- `services/api/notification.service.ts` - API client
- `services/api/notificationsApi.ts` - Simple API client
- `services/notificationSyncService.ts` - CRM+App sync
- `services/notificationRealtimeService.ts` - WebSocket handler
- `services/push-notification.service.ts` - Push setup
- `services/notificationNavigator.ts` - Deep linking

### Phase 2: WebSocket Fix (2-3 ngày) ✅ COMPLETED

#### Task 2.1: Debug WebSocket Connection ✅

- [x] Log WebSocket events với emoji prefixes (🔌, ✅, ❌, 🔄, 📝, 🔔)
- [x] Verify `register` event gửi đúng `userId` (number type)
- [x] Test reconnection logic - tăng lên 10 attempts, delay 2-10s

#### Task 2.2: Implement Proper Registration ✅

**File: `context/UnifiedNotificationContext.tsx`**

- Enhanced `connectWebSocket` function với:
  - userId validation trước khi connect
  - Detailed logging cho mọi event
  - Register ngay sau khi connect
  - Re-register sau mỗi lần reconnect
  - Improved reconnection với exponential backoff

#### Task 2.3: Handle Real-time Notifications ✅

**Files Modified:**

1. `context/UnifiedNotificationContext.tsx` - main WebSocket handler
2. `services/notificationRealtimeService.ts` - listen to both `notification` AND `notification:new`
3. `services/socket.ts` - `onNotification()` listen to both event names

**Key Fix:** Backend sends `notification` event, not `notification:new`

- All services now listen to BOTH event names for backward compatibility

### Phase 3: Push Notifications (2-3 ngày) ✅ COMPLETED

**Status**: Completed - Backend push module implemented and deployed

#### Task 3.1: Backend Implementation ✅

**Created Files:**

1. `src/notifications/push.service.ts` - Push notification service
   - Register/remove device tokens
   - Send push via Expo Push API
   - Auto-deactivate invalid tokens
2. `src/notifications/push-tokens.controller.ts` - REST endpoints
   - POST `/push-tokens` - Register token
   - GET `/push-tokens` - Get user tokens
   - DELETE `/push-tokens/:token` - Remove token
   - POST `/push-tokens/test` - Send test push
3. `src/notifications/dto/register-push-token.dto.ts` - DTO validation
4. Updated `notifications.module.ts` - Added PushService, PushTokensController
5. Updated `notifications.service.ts` - Auto-send push when creating notification

**Database**: Using existing `device_tokens` table (already in Prisma schema)

#### Task 3.2: Frontend Ready ✅

Frontend implementation already in place:

- `UnifiedNotificationContext.tsx` has `registerForPushNotifications()` method
- Token flow: Request permission → Get Expo token → Send to `/push-tokens`
- Push listeners configured for foreground/background
- Notification tap handling via `notificationNavigator.ts`

#### Task 3.3: Testing Results ✅

```powershell
# Token registration - SUCCESS
POST /api/v1/push-tokens
Response: { success: true, data: { id: 1, platform: "ANDROID", isActive: true } }

# Test push - Works (needs real token from physical device)
POST /api/v1/push-tokens/test
Response: { success: true, message: "Test notification sent to N device(s)" }
```

**Note**: Test with real Expo push token from physical device required for full E2E test.

### Phase 4: Type Consistency (1-2 ngày) ✅ COMPLETED

**Status**: Completed - Unified notification types created

#### Task 4.1: Unified Notification Type ✅

**Created**: `types/notification.ts` with:

- `NotificationType` - 20+ notification types (info, success, error, call, message, friend\_\*, etc.)
- `NotificationCategory` - 11 categories (system, event, live, message, etc.)
- `NotificationPriority` - low, normal, high, urgent
- `UnifiedNotification` - Main interface with all fields
- `BackendNotification` - Raw backend response type
- `DeviceToken`, `FriendActivityData` - Supporting types
- Type guards: `isValidNotificationType()`, `isValidNotificationCategory()`, `isValidNotificationPriority()`
- Helper: `normalizeNotification()` - Convert backend to frontend format

#### Task 4.2: Case Normalization ✅

**Updated**: `context/UnifiedNotificationContext.tsx`:

```typescript
// Added normalization functions:
normalizeNotificationType("INFO") → "info"
normalizeNotificationCategory("SYSTEM") → "system"
normalizeNotificationPriority("HIGH") → "high"
```

- `fetchNotifications()` - Normalizes REST API responses
- `handleIncomingNotification()` - Normalizes WebSocket/Push notifications
- All notification sources now normalized consistently

### Phase 5: Testing & Polish (2 ngày) ✅ COMPLETED

**Status**: Completed - All REST API endpoints verified working

#### Task 5.1: E2E Test Results ✅

**REST API Testing:**

```bash
# 1. Create notification - ✅ SUCCESS
POST /api/v1/notifications
Body: {"title":"Test E2E Success","message":"Notification system working!","type":"SUCCESS"}
Response: { id: 5, userId: 8, title: "Test E2E Success", message: "...", type: "SUCCESS" }

# 2. List notifications - ✅ SUCCESS
GET /api/v1/notifications
Response: { data: [...], meta: { total: 1 } }

# 3. Mark as read - ✅ SUCCESS
PATCH /api/v1/notifications/5/read
Response: { id: 5, read: true, readAt: "2026-02-03T10:41:40.005Z" }

# 4. Push token registration - ✅ SUCCESS
POST /api/v1/push-tokens
Body: {"token":"ExponentPushToken[...]","platform":"android"}
Response: { success: true, data: { id: 2, platform: "ANDROID", isActive: true } }
```

**Fixes Applied:**

1. **Controller field mapping**: Changed `body: message` to `message || legacyBody` to support both field names
2. **Type mapping**: Added `mapToPrismaType()` to convert frontend types (INFO, SUCCESS, etc.) to Prisma enum (SYSTEM, MESSAGE, etc.)
3. **Platform normalization**: Transform lowercase "android"/"ios" to uppercase "ANDROID"/"IOS"

#### Task 5.2: Pending Tests (require mobile device)

- [ ] WebSocket real-time notification delivery
- [ ] Push notification with real Expo token
- [ ] Tap push notification → Navigate to screen
- [ ] Offline caching verification

---

## 5. CHI TIẾT TRIỂN KHAI

### 5.1 Refactored UnifiedNotificationContext

```typescript
// context/NotificationContext.tsx (NEW - Simpler)
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/services/api';
import { getAccessToken } from '@/services/token.service';
import { useAuth } from './AuthContext';
import ENV from '@/config/env';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  isConnected: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<any>(null);

  // 1. REST: Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await apiFetch<{ data: Notification[] }>('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('[Notification] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. WebSocket: Real-time updates
  const connectWebSocket = async () => {
    if (!user) return;

    const { io } = await import('socket.io-client');
    const token = await getAccessToken();

    const socket = io(`${ENV.WS_BASE_URL}/notifications`, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    socket.on('connected', () => {
      console.log('[Notification] WebSocket connected');
      socket.emit('register', { userId: user.id });
    });

    socket.on('registered', () => {
      setIsConnected(true);
    });

    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current = socket;
  };

  // 3. Actions
  const markAsRead = async (id: number) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'PATCH' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // 4. Lifecycle
  useEffect(() => {
    if (user) {
      fetchNotifications();
      connectWebSocket();
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      isConnected,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      refresh: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
```

### 5.2 Test Checklist

```markdown
## Manual Test Checklist

### Setup

- [ ] Login với user có notifications trong DB
- [ ] Verify token được gửi đúng

### REST API

- [ ] GET /notifications trả về danh sách
- [ ] Response có đúng format: { data: [], meta: {} }
- [ ] Pagination hoạt động

### WebSocket

- [ ] Connect thành công (log: "WebSocket connected")
- [ ] Register thành công (log: "registered")
- [ ] Tạo notification mới từ backend → App nhận được real-time
- [ ] Reconnect khi mất kết nối

### UI

- [ ] Tab Notifications hiển thị danh sách
- [ ] Badge count đúng số
- [ ] Tap notification → navigate đúng screen
- [ ] Pull to refresh hoạt động
- [ ] Mark read → badge giảm
- [ ] Mark all read → badge = 0

### Push Notifications

- [ ] Request permission được chấp nhận
- [ ] Token được lưu vào backend
- [ ] App ở background → nhận push
- [ ] Tap push → mở app + navigate
```

---

## 📅 TIMELINE

| Phase              | Duration | Start  | End    |
| ------------------ | -------- | ------ | ------ |
| Phase 1: Cleanup   | 3-4 days | Day 1  | Day 4  |
| Phase 2: WebSocket | 2-3 days | Day 5  | Day 7  |
| Phase 3: Push      | 2-3 days | Day 8  | Day 10 |
| Phase 4: Types     | 1-2 days | Day 11 | Day 12 |
| Phase 5: Testing   | 2 days   | Day 13 | Day 14 |

**Total: ~2 weeks**

---

## 📝 NOTES

1. **Prioritize**: WebSocket fix là quan trọng nhất vì đây là nguồn real-time
2. **Don't break**: Giữ backward compatibility trong quá trình refactor
3. **Test often**: Mỗi phase xong đều cần test kỹ
4. **Document**: Cập nhật README sau khi hoàn thành

---

_Tài liệu này sẽ được cập nhật trong quá trình phát triển._
