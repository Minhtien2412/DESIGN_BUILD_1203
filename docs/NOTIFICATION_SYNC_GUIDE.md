# Đồng Bộ Thông Báo CRM & Backend App

## Tổng Quan

Hệ thống đồng bộ thông báo giữa:
- **Perfex CRM** (`thietkeresort.com.vn/perfex_crm`)
- **Backend App** (`baotienweb.cloud/api/v1`)

## Kiến Trúc

```
┌─────────────────────┐     ┌─────────────────────┐
│    Perfex CRM       │     │   Backend App       │
│  (Tasks, Tickets,   │     │  (Notifications,    │
│   Activities)       │     │   WebSocket)        │
└─────────┬───────────┘     └──────────┬──────────┘
          │                            │
          │    NotificationSyncService │
          │ ◄─────────────────────────►│
          │                            │
          └───────────┬────────────────┘
                      │
           ┌──────────▼──────────┐
           │ UnifiedNotification │
           │     (Cache)         │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │  useUnifiedNotifs   │
           │      (Hook)         │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │UnifiedNotifications │
           │     Screen          │
           └─────────────────────┘
```

## Files Đã Tạo/Cập Nhật

### 1. `services/notificationSyncService.ts` (MỚI)
Service đồng bộ thông báo từ cả 2 nguồn:

```typescript
// Sử dụng
import NotificationSyncService from '@/services/notificationSyncService';

// Sync tất cả thông báo
const result = await NotificationSyncService.syncAll({
  customerId: '123',
  contactId: '456',
  projectIds: ['p1', 'p2'],
});

// Lấy thông báo đã cache
const notifications = await NotificationSyncService.getAll();

// Lấy số chưa đọc
const unreadCount = await NotificationSyncService.getUnreadCount();

// Đánh dấu đã đọc
await NotificationSyncService.markAsRead('crm_task_1');
await NotificationSyncService.markAllAsRead();
```

### 2. `services/notificationRealtimeService.ts` (MỚI)
Service kết nối WebSocket nhận thông báo real-time:

```typescript
// Sử dụng
import NotificationRealtimeService from '@/services/notificationRealtimeService';

// Kết nối
await NotificationRealtimeService.connect();

// Đăng ký listener
const unsubscribe = NotificationRealtimeService.subscribe((notification) => {
  console.log('New notification:', notification);
});

// Hủy đăng ký
unsubscribe();
```

### 3. `hooks/useNotifications.ts` (CẬP NHẬT)
Thêm hook `useUnifiedNotifications`:

```typescript
// Sử dụng
import { useUnifiedNotifications } from '@/hooks/useNotifications';

const {
  notifications,           // Tất cả thông báo
  crmNotifications,       // Chỉ từ CRM
  appNotifications,       // Chỉ từ App
  unreadCount,            // Tổng chưa đọc
  crmUnreadCount,         // CRM chưa đọc
  appUnreadCount,         // App chưa đọc
  loading,
  syncing,
  error,
  isOffline,
  lastSyncTime,
  sync,                   // Force sync
  markAsRead,
  markAllAsRead,
  clearCache,
} = useUnifiedNotifications({
  autoSync: true,         // Auto-sync mỗi 5 phút
  syncIntervalMs: 5 * 60 * 1000,
});
```

### 4. `features/notifications/UnifiedNotificationsScreen.tsx` (MỚI)
Màn hình thông báo với tabs CRM/App:

- Tab "Tất cả": Hiển thị tất cả thông báo
- Tab "CRM": Chỉ thông báo từ CRM
- Tab "Hệ thống": Chỉ thông báo từ Backend App
- Badge hiển thị nguồn (CRM/APP)
- Badge ưu tiên (Khẩn cấp/Quan trọng)
- Sync status + Offline indicator

### 5. `app/(tabs)/notifications.tsx` (CẬP NHẬT)
Toggle giữa 2 mode hiển thị:

```typescript
// true: UnifiedNotificationsScreen (CRM + App)
// false: NotificationsScreenModernized (chỉ App)
const ENABLE_UNIFIED = true;
```

## Cấu Trúc UnifiedNotification

```typescript
interface UnifiedNotification {
  id: string;                    // 'crm_task_123' | 'app_456'
  source: 'CRM' | 'APP';         // Nguồn
  sourceId: string;              // ID gốc từ nguồn
  type: NotificationType;        // INFO, TASK, PROJECT, TICKET, MESSAGE, PAYMENT, etc.
  title: string;
  message: string;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  relatedId?: string;            // ID liên quan (task, project, etc.)
  relatedType?: string;          // Loại liên quan
  createdAt: string;
  syncedAt?: string;
}
```

## Luồng Hoạt Động

### 1. Initial Load
```
App khởi động
    ↓
loadCachedData() - Load từ AsyncStorage
    ↓
syncNotifications() - Fetch từ CRM + App
    ↓
NotificationRealtimeService.connect() - Kết nối WebSocket
    ↓
subscribe() - Đăng ký listener real-time
```

### 2. Auto Sync
```
Mỗi 5 phút (configurable)
    ↓
syncNotifications(false) - Background sync
    ↓
Cập nhật cache + UI
```

### 3. Real-time Update
```
WebSocket nhận notification mới
    ↓
handleNewNotification()
    ↓
addToCache()
    ↓
Notify listeners
    ↓
UI cập nhật tự động
```

### 4. User Actions
```
Tap notification → markAsRead() → Navigate
Long press → Menu (mark read/delete)
Pull refresh → sync(true)
Mark all read → markAllAsRead()
```

## CRM Endpoints Sử Dụng

| Endpoint | Mô tả |
|----------|-------|
| `GET /api/tasks` | Lấy danh sách tasks |
| `GET /api/tickets?userid={id}` | Lấy tickets theo customer |
| `GET /api/projects/{id}/discussions` | Lấy cập nhật dự án |
| `GET /api/activity_log` | Lấy hoạt động gần đây |

## Backend Endpoints Sử Dụng

| Endpoint | Mô tả |
|----------|-------|
| `GET /notifications` | Lấy danh sách thông báo |
| `PATCH /notifications/:id/read` | Đánh dấu đã đọc |
| `PATCH /notifications/read-all` | Đánh dấu tất cả đã đọc |
| `DELETE /notifications/:id` | Xóa thông báo |

## WebSocket Events

| Event | Direction | Mô tả |
|-------|-----------|-------|
| `notification:new` | Server → Client | Thông báo mới |
| `notification:read` | Server → Client | Đã đọc |
| `notification:delete` | Server → Client | Đã xóa |
| `notification:sync` | Server → Client | Yêu cầu sync |

## Storage Keys

| Key | Mô tả |
|-----|-------|
| `notification_sync_last` | Thời điểm sync cuối |
| `notification_crm_cache` | Cache notifications |
| `notification_sync_status` | Trạng thái sync |

## Cấu Hình

Trong `config/env.ts`:

```typescript
PERFEX_CRM_URL: 'https://thietkeresort.com.vn/perfex_crm',
PERFEX_API_TOKEN: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
```

## Testing

1. Mở app và vào tab Thông báo
2. Kiểm tra có hiển thị tabs: Tất cả | CRM | Hệ thống
3. Pull refresh để sync
4. Kiểm tra badge nguồn (CRM/APP) trên mỗi thông báo
5. Test offline mode - thông báo vẫn hiển thị từ cache

## Troubleshooting

### Không thấy thông báo CRM
- Kiểm tra `PERFEX_API_TOKEN` còn hạn
- Kiểm tra network connectivity
- Xem console log: `[NotificationSync] CRM tasks: X`

### WebSocket không kết nối
- Kiểm tra `WS_BASE_URL` trong env
- Xem console log: `[NotificationRealtime] Connection failed:`
- Auto-reconnect sẽ thử lại tối đa 5 lần

### Sync chậm
- Giảm `syncIntervalMs` nếu cần update nhanh hơn
- Kiểm tra số lượng `projectIds` truyền vào
