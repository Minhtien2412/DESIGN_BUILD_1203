# Notification System Architecture

> Kiến trúc lấy cảm hứng từ Telegram Desktop: tách **System** (logic) và **Renderer** (hiển thị).

## Tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server                           │
│                                                              │
│  Domain Services → Notification Store (DB) → WS Gateway      │
│                    (lưu lịch sử)          (push real-time)   │
│                                                              │
│  REST API:                                                    │
│    GET  /notifications?cursor=...                             │
│    PATCH /notifications/{id}/read                             │
│    PATCH /notifications/read-all                              │
│    POST  /notifications/ack                                   │
│    GET/PUT /notifications/settings                            │
│                                                              │
│  Job API:                                                     │
│    GET  /jobs/{jobId}                                         │
│    POST /jobs/{jobId}/cancel                                  │
│    GET  /jobs/active                                          │
└──────────────┬──────────────────────┬───────────────────────┘
               │ REST                 │ WebSocket
               ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Client App                                │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │        NotificationControllerContext                  │     │
│  │   (React Provider – kết nối tất cả lại)              │     │
│  │                                                       │     │
│  │   ┌──────────┐  ┌──────────────┐  ┌──────────────┐  │     │
│  │   │ WS Client│  │ REST Fetcher │  │ expo-notif   │  │     │
│  │   └────┬─────┘  └──────┬───────┘  └──────────────┘  │     │
│  │        │                │                             │     │
│  │        ▼                ▼                             │     │
│  │  ┌──────────────────────────────┐                    │     │
│  │  │    NotificationSystem        │ ← Logic engine     │     │
│  │  │  • Queue                     │                    │     │
│  │  │  • Dedupe (dedupeKey)        │                    │     │
│  │  │  • Grouping (Telegram-style) │                    │     │
│  │  │  • Skip/Mute rules           │                    │     │
│  │  │  • User settings             │                    │     │
│  │  └──────────┬───────────────────┘                    │     │
│  │             │ events                                  │     │
│  │             ▼                                         │     │
│  │  ┌──────────────────────────────┐                    │     │
│  │  │    NotificationRenderer      │ ← Display engine   │     │
│  │  │  • Toast (react-native-toast)│                    │     │
│  │  │  • Sound / Vibrate           │                    │     │
│  │  │  • Badge count               │                    │     │
│  │  │  • (Future: email, SMS)      │                    │     │
│  │  └──────────────────────────────┘                    │     │
│  │                                                       │     │
│  │  ┌──────────────────────────────┐                    │     │
│  │  │    JobProgressManager        │ ← Pending jobs     │     │
│  │  │  • createPendingJob()        │                    │     │
│  │  │  • WS: job.progress/done/fail│                    │     │
│  │  │  • Progress bar overlay      │                    │     │
│  │  └──────────────────────────────┘                    │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  UI Components:                                               │
│    • NotificationCenter (list + filter + mark read)           │
│    • NotificationSettings (mute, quiet hours, categories)     │
│    • JobProgressOverlay (floating progress bar)               │
│    • NotificationBadge (bell icon + count)                    │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
services/notification-system/
  ├── index.ts                  # Barrel export
  ├── types.ts                  # All type definitions + WS event schemas
  ├── NotificationSystem.ts     # Core logic: queue, dedupe, group, rules
  ├── NotificationRenderer.ts   # Toast, sound, vibrate, badge
  └── JobProgressManager.ts     # Pending job tracking

context/
  └── NotificationControllerContext.tsx  # React provider + hooks

hooks/
  └── useJobWithProgress.ts     # Hook for API calls with job tracking

app/
  ├── notification-center.tsx   # Full notification list screen
  └── notification-settings.tsx # User preferences screen

components/notifications/
  └── JobProgressOverlay.tsx    # Floating progress overlay

constants/
  └── api-endpoints.ts          # Added ACK, SETTINGS, JOB_ENDPOINTS
```

## WebSocket Event Schema

### Push Notification (server → client)

```json
{
  "type": "notification.created",
  "id": "ntf_123",
  "userId": 1001,
  "category": "booking",
  "severity": "info",
  "title": "Đơn mới",
  "body": "Bạn có 1 booking mới #BK1024",
  "deeplink": "/bookings/BK1024",
  "createdAt": "2026-03-05T04:12:30Z",
  "dedupeKey": "booking:BK1024:created"
}
```

### Job Progress (server → client)

```json
{
  "type": "job.progress",
  "jobId": "job_789",
  "stage": "exporting",
  "progress": 65,
  "message": "Đang xuất báo cáo (65%)"
}
```

### Job Done

```json
{
  "type": "job.done",
  "jobId": "job_789",
  "result": { "url": "/files/rpt_2026_03.pdf" }
}
```

### Job Failed

```json
{
  "type": "job.failed",
  "jobId": "job_789",
  "error": "Timeout: export quá 5 phút"
}
```

### Badge Sync (server → client)

```json
{
  "type": "badge.sync",
  "counts": { "chat": 3, "booking": 1, "system": 0 },
  "total": 4
}
```

## Usage Examples

### 1. Wrap app with provider (in `_layout.tsx`)

```tsx
import { NotificationControllerProvider } from "@/context/NotificationControllerContext";
import { JobProgressOverlay } from "@/components/notifications/JobProgressOverlay";

// Inside your provider stack (after AuthProvider):
<NotificationControllerProvider>
  {/* ... other providers ... */}
  <Stack />
  <JobProgressOverlay />
</NotificationControllerProvider>;
```

### 2. Show notification badge

```tsx
import { useNotificationController } from "@/context/NotificationControllerContext";

function Header() {
  const { unreadCount } = useNotificationController();
  return (
    <Pressable onPress={() => router.push("/notification-center")}>
      <Ionicons name="notifications" size={24} />
      {unreadCount > 0 && <Badge count={unreadCount} />}
    </Pressable>
  );
}
```

### 3. Use pending jobs for async operations

```tsx
import { useJobWithProgress } from "@/hooks/useJobWithProgress";
import { post } from "@/services/api";

function CreateBookingScreen() {
  const { execute, isRunning } = useJobWithProgress({
    label: "Đang tạo booking…",
    resultRoute: "/bookings",
    jobIdField: "jobId", // Auto-map from response
  });

  const handleSubmit = async () => {
    await execute(async (localJobId) => {
      const res = await post("/api/v1/bookings", { ...formData });
      return res; // { success: true, jobId: "job_xyz" }
    });
  };

  return (
    <Button onPress={handleSubmit} disabled={isRunning}>
      {isRunning ? "Đang xử lý…" : "Tạo booking"}
    </Button>
  );
}
```

### 4. Filter notifications by category

```tsx
import { useNotificationCenter } from "@/context/NotificationControllerContext";

function ChatBadge() {
  const { unreadByCategory } = useNotificationCenter();
  const chatUnread = unreadByCategory("chat");
  return chatUnread > 0 ? <Badge count={chatUnread} /> : null;
}
```

### 5. Manage notification settings

```tsx
import { useNotificationSettings } from "@/context/NotificationControllerContext";

function QuietModeToggle() {
  const { settings, updateSettings } = useNotificationSettings();
  return (
    <Switch
      value={settings.globalMute}
      onValueChange={(v) => updateSettings({ globalMute: v })}
    />
  );
}
```

## Grouping Logic (Telegram-style)

1. Notification arrives via WS
2. System checks: is it duplicate? (`dedupeKey` or `id`)
3. System checks: should skip? (muted category, quiet hours, global mute)
4. If grouping enabled: enqueue to group buffer with key `{category}:{contextId}`
5. Wait `groupingWindowMs` (default 2s)
6. If 1 item in buffer → show single toast
7. If N items → create group: "Bạn có N tin nhắn mới" → show group toast
8. All items saved to Notification Center regardless of toast display

## Migration from Existing Contexts

The new system coexists with existing notification contexts. To migrate:

1. Add `NotificationControllerProvider` to `_layout.tsx` provider stack
2. Screens can use either:
   - `useNotificationController()` (new unified system)
   - `useNotifications()` (legacy - still works)
3. Gradually migrate screens to use the new hooks
4. Eventually remove old providers: `NotificationProvider`, `PushNotificationProvider`, `NotificationsProvider`
