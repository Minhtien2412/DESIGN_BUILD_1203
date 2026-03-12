# 📢 BÁO CÁO HỆ THỐNG THÔNG BÁO

**Ngày kiểm tra:** 27/01/2026  
**Trạng thái:** ✅ Backend hoạt động | ✅ Frontend đã sửa lỗi WebSocket

---

## 🔧 SỬA LỖI ĐÃ THỰC HIỆN

### 1. Thêm WebSocket Notification Namespace (config/env.ts)

```typescript
// Thêm mới
WS_NOTIFICATION_NS: "/notifications"; // NotificationsGateway namespace
```

### 2. Cập nhật WebSocket URL trong NotificationContext.tsx

```typescript
// Trước (LỖI)
const wsUrl = (ENV.WS_URL || "").replace("/ws", "/notifications");

// Sau (ĐÚNG)
const wsBaseUrl = ENV.WS_BASE_URL || ENV.WS_URL || "wss://baotienweb.cloud";
const notificationNs = ENV.WS_NOTIFICATION_NS || "/notifications";
const wsUrl = `${wsBaseUrl}${notificationNs}`;
```

---

## 📊 TỔNG QUAN KIẾN TRÚC

### 🔹 Backend (103.200.20.100)

| Component           | File                                                                    | Status |
| ------------------- | ----------------------------------------------------------------------- | ------ |
| REST API Controller | `/var/www/baotienweb-api/src/notifications/notifications.controller.ts` | ✅ OK  |
| WebSocket Gateway   | `/var/www/baotienweb-api/src/notifications/notifications.gateway.ts`    | ✅ OK  |
| Service             | `/var/www/baotienweb-api/src/notifications/notifications.service.ts`    | ✅ OK  |
| Prisma Schema       | `prisma/schema.prisma` - notifications table                            | ✅ OK  |

**API Endpoints:**

- `GET /api/v1/notifications` - Lấy danh sách thông báo
- `GET /api/v1/notifications/unread-count` - Đếm thông báo chưa đọc
- `PATCH /api/v1/notifications/:id/read` - Đánh dấu đã đọc
- `PATCH /api/v1/notifications/read-all` - Đánh dấu tất cả đã đọc
- `PATCH /api/v1/notifications/:id/archive` - Xóa/Lưu trữ thông báo

**WebSocket Namespace:** `/notifications`

- Event `register` - Đăng ký user vào room
- Event `notification` - Nhận thông báo realtime
- Event `broadcast` - Nhận thông báo system-wide
- Hỗ trợ multi-device (1 user nhiều thiết bị)

---

### 🔹 Frontend (React Native/Expo)

#### ⚠️ VẤN ĐỀ: 3 CONTEXT PROVIDERS CHỒNG CHÉO

| #   | File                                  | Purpose                            | Export                   |
| --- | ------------------------------------- | ---------------------------------- | ------------------------ |
| 1   | `context/NotificationContext.tsx`     | WebSocket + REST API               | `useNotifications()`     |
| 2   | `context/NotificationsContext.tsx`    | expo-notifications + socketManager | `useNotifications()`     |
| 3   | `context/PushNotificationContext.tsx` | Push notifications Expo            | `usePushNotifications()` |

**❌ Vấn đề chính:**

- **Trùng tên export:** Cả `NotificationContext.tsx` và `NotificationsContext.tsx` đều export `useNotifications()`
- **Chồng chéo chức năng:** Cả 2 đều quản lý WebSocket notifications
- **Khó bảo trì:** Developer không biết nên import từ file nào

---

## 📂 FILE STRUCTURE LIÊN QUAN

```
context/
├── NotificationContext.tsx    (407 lines) - WebSocket + REST
├── NotificationsContext.tsx   (330 lines) - expo-notifications + socket
├── PushNotificationContext.tsx (237 lines) - Push notifications
├── NotificationBadgeContext.tsx           - Badge count
└── UnifiedBadgeContext.tsx               - Unified badge

features/notifications/
├── UnifiedNotificationsScreen.tsx (831 lines) - Main UI
├── index.ts                       - Re-exports
└── storage/
    └── notificationsStore.ts     - AsyncStorage

hooks/
└── useNotifications.ts (506 lines)
    ├── useNotifications()        - Basic hook
    └── useUnifiedNotifications() - Unified CRM+App

services/
├── notificationSyncService.ts (733 lines) - CRM + App sync
├── notificationNavigator.ts              - Deep linking
└── websocket/
    └── socketManager.ts                  - Socket.IO client
```

---

## ✅ NHỮNG GÌ HOẠT ĐỘNG TỐT

1. **Backend API:** Tất cả endpoints hoạt động (đã test với curl)
2. **WebSocket Gateway:** Hỗ trợ multi-device, register/ping/pong
3. **Unified Notifications Screen:** UI đẹp với tabs, grouping
4. **Notification Sync Service:** Đồng bộ CRM + App Backend
5. **PM2 Process:** Backend chạy ổn định với pm2
6. **Video Cache:** 205 videos cached, 332.74 MB

---

## ⚠️ KHUYẾN NGHỊ CẢI THIỆN

### 1. Hợp nhất Notification Contexts

```tsx
// Đề xuất: Tạo file context duy nhất
// context/UnifiedNotificationContext.tsx

// Giữ lại:
// - NotificationContext.tsx (rename → LegacyNotificationContext)
// - Tạo mới UnifiedNotificationContext với:
//   - WebSocket real-time
//   - REST API fallback
//   - expo-notifications integration
//   - Badge management
```

### 2. Đổi tên để tránh conflict

```tsx
// NotificationContext.tsx
export function useNotificationContext() { ... }  // Đổi tên

// NotificationsContext.tsx
export function useNotificationsManager() { ... } // Đổi tên
```

### 3. Provider Order trong \_layout.tsx

Hiện tại:

```
NotificationProvider → PushNotificationProvider → NotificationsProvider
```

Đề xuất giữ nguyên vì:

- Inner providers có thể access outer providers
- NotificationsProvider có thể dùng NotificationProvider

---

## 🔧 TRẠNG THÁI HIỆN TẠI

### TypeScript Errors

- ✅ `context/NotificationContext.tsx` - Không có lỗi
- ✅ `context/NotificationsContext.tsx` - Không có lỗi
- ✅ `context/PushNotificationContext.tsx` - Không có lỗi
- ✅ `services/notificationSyncService.ts` - Không có lỗi
- ✅ `hooks/useNotifications.ts` - Không có lỗi

### Imports hiện tại trong codebase

| File                                                    | Import từ                                            |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `features/notifications/index.ts`                       | `@/context/NotificationContext`                      |
| `components/ui/NotificationBell.tsx`                    | `@/context/NotificationContext`                      |
| `components/examples/VideoCallExample.tsx`              | `@/context/NotificationsContext`                     |
| `features/notifications/UnifiedNotificationsScreen.tsx` | `@/hooks/useNotifications` (useUnifiedNotifications) |

---

## 📝 KẾT LUẬN

**Hệ thống notification hiện tại HOẠT ĐỘNG nhưng có kiến trúc phức tạp do lịch sử phát triển.**

**Ưu tiên hành động:**

1. ✅ Backend ổn định - Không cần thay đổi
2. ⚠️ Frontend cần refactor để gộp contexts (khi có thời gian)
3. ✅ Sử dụng `useUnifiedNotifications()` cho màn hình chính
4. ✅ Sử dụng `UnifiedBadgeContext` cho badge counts

**Không có lỗi critical ảnh hưởng đến user experience.**

---

## 📱 HỆ THỐNG TIN NHẮN HỆ THỐNG (System Messages)

### Các loại thông báo hỗ trợ:

| Type      | Description        | Tab hiển thị |
| --------- | ------------------ | ------------ |
| `MESSAGE` | Tin nhắn chat      | Tin nhắn     |
| `CALL`    | Cuộc gọi nhỡ       | Cuộc gọi     |
| `system`  | Thông báo hệ thống | Hệ thống     |
| `project` | Cập nhật dự án     | Tất cả/CRM   |
| `task`    | Công việc          | Tất cả/CRM   |
| `event`   | Sự kiện            | Tất cả       |
| `live`    | Livestream         | Tất cả       |

### Flow thông báo hệ thống:

```
Backend (NestJS) → WebSocket Gateway → NotificationContext → UI (Toast/Screen)
                                     ↓
                              REST API fallback
                                     ↓
                              notificationSyncService → CRM sync
```

### Files liên quan tin nhắn hệ thống:

- [features/notifications/UnifiedNotificationsScreen.tsx](features/notifications/UnifiedNotificationsScreen.tsx) - Tab "Hệ thống"
- [features/notifications/NotificationsScreenModernized.tsx](features/notifications/NotificationsScreenModernized.tsx) - Filter system
- [features/chat/GroupChatScreen.tsx](features/chat/GroupChatScreen.tsx) - System message trong chat
- [types/notification-timeline.ts](types/notification-timeline.ts) - Category `system`

---

## ✅ KẾT LUẬN CUỐI CÙNG

| Component           | Status       | Notes                |
| ------------------- | ------------ | -------------------- |
| Backend API         | ✅ Hoạt động | PM2 chạy ổn định     |
| WebSocket Gateway   | ✅ Hoạt động | Multi-device support |
| Frontend Contexts   | ⚠️ Cải thiện | Đã sửa WebSocket URL |
| Notification Screen | ✅ Hoạt động | Tabs + grouping      |
| System Messages     | ✅ Hoạt động | Tab "Hệ thống"       |
| Badge Sync          | ✅ Hoạt động | UnifiedBadgeContext  |

**Hệ thống thông báo + tin nhắn hệ thống đã được kiểm tra và hoạt động tốt!**
